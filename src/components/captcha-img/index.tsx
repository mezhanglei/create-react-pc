import './index.less';
import React from "react";
import { isArray } from "@/utils/type";

export interface CaptchaImgProps {
  imgUrl: Array<string> // 图片的路径
  cw: number // 裁剪的宽高
  ch: number
  width: number // 区域图片的宽高
  height: number
  precision: number // 允许重合误差
  onSuccess?: () => void // 成功事件
  onError?: () => void // 失败事件
}

export interface CaptchaImgState {
  flag: boolean
  sliderLeft: number
  clipleft: number
  preEventX: number
}

// 拖拽图形验证码
class CaptchaImg extends React.Component<CaptchaImgProps, CaptchaImgState> {
  clipCanvas?: HTMLCanvasElement | null;
  captchaBox?: HTMLDivElement | null;
  imgCanvas?: HTMLCanvasElement | null;
  sliderBtn?: HTMLDivElement | null;
  messageBar?: HTMLDivElement | null;
  constructor(props: CaptchaImgProps) {
    super(props);
    this.state = {
      flag: false,
      sliderLeft: 0,
      clipleft: 0,
      preEventX: 0
    };
  }
  static defaultProps = {
    imgUrl: [require('./images/bg/demo.jpeg'), require('./images/bg/demo1.jpeg'), require('./images/bg/demo2.jpg'), require('./images/bg/demo3.jpg')],
    cw: 66,
    ch: 66,
    precision: 5,
    width: 500,
    height: 400
  }

  componentDidMount() {
    this.initData();
  }

  createCanvas(w: number, h: number) {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    return canvas;
  }

  // 随机位置
  randomNum(min: number, max: number) {
    const rangeNum = max - min;
    const num = min + Math.round(Math.random() * rangeNum);
    return num;
  }

  // 获得裁剪的位置
  getClipPoint(w: number, h: number) {
    const padding = 10;
    const startw = this.props.cw + padding;
    const starth = this.props.ch + padding;
    if (w < startw * 2 || h < starth) return;

    const startPoint = {
      clipX: this.randomNum(startw, w - startw),
      clipY: this.randomNum(padding, h - starth)
    };
    return startPoint;
  }

  // 绘画裁剪区域
  clipPath(ctx: CanvasRenderingContext2D, clipX: number, clipY: number) {
    clipX = clipX + 0.2;
    clipY = clipY + 0.2;

    const subw = Math.round((this.props.cw - 1) / 6);
    const subh = Math.round((this.props.ch - 1) / 6);
    const radius = Math.min(subw, subh);
    const clipw = subw * 5 + 0.5;
    const cliph = subh * 5 + 0.5;

    ctx.beginPath();
    ctx.moveTo(clipX, clipY);
    ctx.lineTo(clipX + clipw, clipY);
    ctx.lineTo(clipX + clipw, clipY + Math.round(cliph / 2) - radius);
    ctx.arc(clipX + clipw, clipY + Math.round(cliph / 2), radius, -Math.PI / 2, Math.PI / 2, false);
    ctx.lineTo(clipX + clipw, clipY + cliph);
    ctx.lineTo(clipX + clipw - (Math.round(clipw / 2) - radius), clipY + cliph);
    ctx.arc(clipX + Math.round(clipw / 2), clipY + cliph, radius, 0, Math.PI, false);
    ctx.lineTo(clipX, clipY + cliph);
    ctx.lineTo(clipX, clipY);
    ctx.closePath();
  }

  // 填充裁剪区域
  fillClip(canvas: HTMLCanvasElement, clipX: number, clipY: number, alpha: number) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      this.clipPath(ctx, clipX, clipY);
      ctx.fillStyle = "rgba(0,0,0, " + alpha + ")";
      ctx.fill();
    }
  }

  // 描边
  strokeClip(canvas: HTMLCanvasElement, clipX: number, clipY: number) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      this.clipPath(ctx, clipX, clipY);
      ctx.strokeStyle = "#fff";
      ctx.stroke();
    }
  }

  // 事件监听
  eventInit(clipX: number) {
    const sliderBtn = this.sliderBtn;
    const clipcanvas = this.clipCanvas;
    const messageBar = this.messageBar;
    const captchaBox = this.captchaBox;
    if (!messageBar || !clipcanvas || !sliderBtn || !captchaBox) return;
    const messageOriginClass = messageBar.className;
    let { sliderLeft, clipleft, flag, preEventX } = this.state;
    const that = this;
    sliderLeft = parseFloat(getComputedStyle(sliderBtn, null).getPropertyValue('left'));
    clipleft = parseFloat(getComputedStyle(clipcanvas, null).getPropertyValue('left'));

    const reset = function () {
      const boxClassName = captchaBox.className;
      captchaBox.className += ' shake';

      setTimeout(function () {
        sliderBtn.style.left = "10px";
        clipcanvas.style.left = "20px";
        sliderLeft = 10;
        clipleft = 20;
      }, 500);

      setTimeout(function () {
        messageBar.className = messageOriginClass;
        captchaBox.className = boxClassName;
      }, 1500);
    };

    const moveStart = function (e) {
      flag = true;
      if (e.touches) {
        preEventX = e.touches[0].clientX;
      } else {
        preEventX = e.clientX;
      }
    };

    const move = function (e: any) {
      let disX;
      if (flag) {
        if (e.touches) {
          disX = e.touches[0].clientX - preEventX;
        } else {
          disX = e.clientX - preEventX;
        }
        sliderBtn.style.left = sliderLeft + disX + "px";
        clipcanvas.style.left = clipleft + disX + "px";

        if (e.preventDefault) e.preventDefault();
        return false;
      }
    };

    const moveEnd = function () {
      if (flag) {
        flag = false;
        sliderLeft = parseFloat(getComputedStyle(sliderBtn, null).getPropertyValue('left'));
        clipleft = parseFloat(getComputedStyle(clipcanvas, null).getPropertyValue('left'));

        if (Math.abs(clipX - sliderLeft) <= that.props.precision) {
          messageBar.innerHTML = '验证通过';
          messageBar.className = messageOriginClass + ' success';
          that.props.onSuccess && that.props.onSuccess();
        } else {
          messageBar.innerHTML = '拖动滑块将悬浮图像正确拼合';
          messageBar.className = messageOriginClass + ' fail';
          reset();
          that.props.onError && that.props.onError();
        }
      }
    };

    sliderBtn.addEventListener("touchstart", moveStart, false);
    sliderBtn.addEventListener("mousedown", moveStart, false);
    document.addEventListener("touchmove", move, false);
    document.addEventListener("mousemove", move, false);
    document.addEventListener('touchend', moveEnd, false);
    document.addEventListener('mouseup', moveEnd, false);
  }

  initData = () => {
    const imgCanvas = this.imgCanvas;
    const clipCanvas = this.clipCanvas;
    if (!imgCanvas || !clipCanvas) return;
    // 实例化img,并最终渲染到canvas画布上进行操作
    const img = new Image();
    const imgUrl = isArray(this.props.imgUrl) ? this.props.imgUrl : [];
    const urlIndex = Math.floor(Math.random() * imgUrl.length);
    img.src = imgUrl[urlIndex];
    const that = this;
    img.onload = function () {
      const w = imgCanvas.width;
      const h = imgCanvas.height;
      imgCanvas?.getContext('2d')?.drawImage(img, 0, 0, w, h);

      // 图片裁剪的位置
      const startPoint = that.getClipPoint(w, h);
      if (!startPoint) {
        console.error("can not get the start point");
        return;
      }

      // 绘画并填充裁剪区域
      const clipX = startPoint.clipX;
      const clipY = startPoint.clipY;
      that.fillClip(imgCanvas, clipX, clipY, 0.7);

      // 创建画布(目标图像)
      const sourceCanvas = that.createCanvas(w, h);
      const sctx = sourceCanvas.getContext('2d');
      if (!sctx) return;
      sctx.drawImage(img, 0, 0, w, h);
      // 只有源图像内的目标图像部分会被显示，源图像透明
      sctx.globalCompositeOperation = 'destination-in';

      // 创建裁剪区域(源图像)
      const destCanvas = that.createCanvas(that.props.cw, that.props.ch);
      that.fillClip(destCanvas, 0, 0, 1);
      sctx.drawImage(destCanvas, clipX, clipY);

      // 将图像画布中的指定位置大小的区域(裁剪区域)复制并放到新的画布上
      clipCanvas?.getContext('2d')?.putImageData(sctx.getImageData(clipX, clipY, that.props.cw, that.props.ch), 0, 0);
      that.strokeClip(clipCanvas, 0, 0);
      clipCanvas.style.top = clipY + 'px';
      // 事件监听
      that.eventInit(clipX);
    };
  }

  render() {
    return (
      <div ref={node => this.captchaBox = node} className='captcha-box' style={{ width: this.props.width + 'px' }}>
        <div className='canvas-box'>
          <canvas ref={node => this.imgCanvas = node} id="canvas" width={this.props.width} height={this.props.height} className='captcha-bg'></canvas>
          <div ref={node => this.messageBar = node} className='captcha-message'></div>
        </div>
        <div className='captcha-dragbar'>
          <div className='drag-track'></div>
          <div id="drag-slider" ref={node => this.sliderBtn = node} className='drag-slider'></div>
          <div className='drag-btn'>
            <i id="drag-btn-close" className='close' />
            <i id="drag-btn-refresh" className='refresh' />
          </div>
        </div>
        <canvas ref={node => this.clipCanvas = node} id="captcha-clipcanvas" className='captcha-clipcanvas' />
      </div>
    );
  }
}

export default CaptchaImg;
