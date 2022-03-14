import React, { useEffect, useRef, useState } from "react";
import * as ReactDOM from "react-dom";
import { DarkColors, LightColors } from "./defaultColors";
import "./ToastsContainer.less";
import classNames from 'classnames';
import { ToastsPosition, ToastProps } from "./type";
import {nanoid} from "nanoid";

// toast容器
const ToastsContainer = React.forwardRef<{}, ToastProps>((props, ref) => {

  const {
    prefixCls = "mine-toast",
    position = ToastsPosition.MIDDLE_CENTER,
    timer = 2000,
    lightBackground = false,
    className,
    maxLength = 1,
    ...restProps
  } = props;

  // ref转发实例方法
  React.useImperativeHandle(ref, () => ({
    AddToast: AddToast,
    clear: clear,
    clearTime: clearTime
  }));

  // toast数组
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const toastsRef = useRef<ToastProps[]>([]);
  // 缓存删掉toast的方法
  const cacheRef = useRef<any[]>([]);

  // 根据传入的position参数决定位置
  const getPosition = (position: ToastsPosition | undefined) => {
    const styles: React.CSSProperties = {};
    switch (position) {
      case ToastsPosition.TOP_LEFT:
        styles.top = 10;
        styles.left = 10;
        break;
      case ToastsPosition.TOP_RIGHT:
        styles.top = 10;
        styles.right = 10;
        break;
      case ToastsPosition.TOP_CENTER:
        styles.top = 10;
        styles.left = "50%";
        styles.transform = "translateX(-50%)";
        break;
      case ToastsPosition.MIDDLE_CENTER:
        styles.top = '50%';
        styles.left = "50%";
        styles.transform = "translateX(-50%) translateY(-50%)";
        break;
      case ToastsPosition.BOTTOM_LEFT:
        styles.bottom = 10;
        styles.left = 10;
        break;
      case ToastsPosition.BOTTOM_RIGHT:
        styles.bottom = 10;
        styles.right = 10;
        break;
      case ToastsPosition.BOTTOM_CENTER:
        styles.bottom = 10;
        styles.left = "50%";
        styles.transform = "translateX(-50%)";
        break;
      default:
        styles.bottom = 10;
        styles.right = 10;
        break;
    }
    return styles;
  };

  // toasts数组的变化
  const toastChange = (value: ToastProps[]) => {
    setToasts(value);
    toastsRef.current = value;
  };

  // 添加toast事件
  const AddToast = async () => {
    await clear();
    // 添加一个toast
    const toast: ToastProps = { prefixCls, position, timer, lightBackground, className, ...restProps, id: nanoid(6) };
    const newToasts = [toast].concat(toasts);
    toastChange(newToasts);
    // 隔一段时间删掉
    cacheRef.current.push(setTimeout(() => {
      const result = toastsRef.current.filter((t) => t.id !== toast.id);
      toastChange(result);
    }, timer));
  };

  useEffect(() => {
    return () => {
      clearTime();
    };
  }, []);

  // 清空定时器
  const clearTime = () => {
    cacheRef.current.forEach(clearTimeout);
  };

  // 清空Toast事件
  const clear = () => {
    setToasts([]);
  };

  // toast类名
  const toastCls = (toast: ToastProps) => {
    const baseCls = `${toast.prefixCls}-child`;
    const toastClass = classNames(baseCls, toast.className, {
      [`${baseCls}-${toast.type}`]: toast.type
    });
    return toastClass;
  };

  // toast的style样式
  const toastStyle: any = lightBackground ? LightColors : DarkColors;

  // 容器类名
  const groupCls = classNames(prefixCls, className);

  // 返回toast
  const renderContainer = (): React.ReactNode => {
    return (
      <div style={getPosition(position)} className={groupCls}>
        {
          toasts.slice(0, maxLength)?.map((toast: ToastProps) => {
            return (
              <div key={toast.id}
                className={toastCls(toast)}
                style={toastStyle[toast.type]}>
                {toast.message}
              </div>
            );
          })
        }
      </div>
    );
  };

  return ReactDOM.createPortal(
    renderContainer(),
    document.body,
  );
});

export default function RenderContainer(props: ToastProps) {
  let div = document.createElement('div');
  document.body.appendChild(div);

  // 渲染真实dom,  ReactDOM.render渲染类组件会返回实例，渲染函数组件返回null，所以只能通过ref获取引用
  let containerNode: any;
  ReactDOM.render(<ToastsContainer ref={(node) => containerNode = node} {...props} />, div);

  // 展示
  const show = () => {
    containerNode && containerNode.AddToast();
  };

  // 清空
  const clear = () => {
    containerNode && containerNode.clear();
  };

  // 销毁
  const destroy = () => {
    // 销毁节点并移除插入节点
    const unmountResult = ReactDOM.unmountComponentAtNode(div);
    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div);
    }
  };

  return { show, clear, destroy };
};
