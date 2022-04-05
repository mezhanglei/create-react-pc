import { arrayMove } from '@/utils/array';
import { css, getOffsetWH, insertAfter, insertBefore } from '@/utils/dom';
import React from 'react';
import { getIndex } from './utils';
import anime from 'animejs';
import { isEventTouch } from '@/utils/verify';
import { MouseButton } from '@/utils/mouse';
import { klona } from 'klona';

class List extends React.Component {
  dragged: any;
  over: any;
  cloneDragged: any;
  lastDisplay?: string;
  dgChangeIndex?: number;
  constructor(props) {
    super(props);
    this.dragged = null;
    this.state = { ...props };
  }

  onMouseDown(e) {
    if (!isEventTouch(e) && typeof (e as any).button === 'number' && (e as any).button !== MouseButton.left) return;
    e.currentTarget.draggable = true;
    this.lastDisplay = css(e.currentTarget)?.display;
  }

  onMouseUp(e) {
    e.currentTarget.draggable = undefined;
  }

  onDragStart(e) {
    this.dragged = e.currentTarget;
    this.cloneDragged = this.dragged.cloneNode(true);
  }

  // 拖拽结束事件
  dragEnd(e: any) {
    // 拖拽元素
    const dragged = this.dragged;
    // 克隆拖拽元素
    const cloneDragged = this.cloneDragged;
    // 目标元素
    const over = this.over;

    let data = this.state.data;
    const from = getIndex(dragged, cloneDragged);
    const to = getIndex(cloneDragged, dragged);
    if (typeof from === 'number' && typeof to === 'number') {
      data = arrayMove(data, from, to);
      this.setState({ data: data });
    }
    // 重置
    dragged.draggable = undefined;
    dragged.style.display = this.lastDisplay;
    over?.classList?.remove("move-up", "move-down");
    cloneDragged.parentNode.removeChild(cloneDragged);
  }

  dragOver(e: any) {
    e.preventDefault();

    const dragged = this.dragged;
    const cloneDragged = this.cloneDragged;
    const oldOver = this.over;
    const newOver = e.target;
    // 添加拖拽副本
    if (dragged.style.display !== "none") {
      insertAfter(cloneDragged, dragged);
      this.dgChangeIndex = getIndex(cloneDragged, dragged);
    }
    dragged.style.display = "none";
    // 避免触发对象为外面容器
    if (newOver.tagName !== "LI" || dragged == newOver) {
      return;
    }
    // 拖拽的序号
    const dgIndex = getIndex(cloneDragged, dragged);
    // 当前over的目标序号
    const newOverIndex = getIndex(newOver, dragged);
    // 上一个over的目标序号
    const oldOverIndex = getIndex(oldOver, dragged);
    let animateName;
    if (typeof dgIndex !== 'number' || typeof newOverIndex !== 'number') return;
    // over目标向下移动
    if (dgIndex > newOverIndex) {
      animateName = "move-down";
      // over目标向上移动
    } else if (dgIndex < newOverIndex) {
      animateName = "move-up";
    }
    const animeConfig = {
      duration: 200,
      easing: 'linear'
    }
    // 如果需要交换则添加交换类名
    if (animateName && !newOver.classList.contains(animateName)) {
      // 更新位置后的序号
      const dgChangeIndex = this.dgChangeIndex as number;
      const draggedWH = getOffsetWH(cloneDragged)
      if (!draggedWH) return;
      const draggedWidth = draggedWH?.width;
      const draggedHeight = draggedWH?.height;
      const diffIndex = newOverIndex - dgChangeIndex;
      const diffY = diffIndex * draggedHeight;
      const diffX = 0;
      if (animateName == 'move-down') {
        anime({
          targets: newOver,
          translateX: diffX,
          translateY: draggedHeight,
          ...animeConfig
        });
        anime({
          targets: cloneDragged,
          translateX: diffX,
          translateY: diffY,
          ...animeConfig,
          complete: function (anim) {
            anime.set(newOver, { translateY: 0 });
            anime.set(cloneDragged, { translateY: 0 });
            insertBefore(cloneDragged, newOver);
          }
        });
      } else {
        anime({
          targets: newOver,
          translateX: diffX,
          translateY: -draggedHeight,
          ...animeConfig
        });
        anime({
          targets: cloneDragged,
          translateX: diffX,
          translateY: diffY,
          ...animeConfig,
          complete: function (anim) {
            anime.set(newOver, { translateY: 0 });
            anime.set(cloneDragged, { translateY: 0 });
            insertAfter(cloneDragged, newOver);
          }
        });
      }
      // 添加动画
      newOver.classList.add(animateName);
      this.over = newOver;
      this.dgChangeIndex = newOverIndex;
    }
    // 经过新的项则清除旧的项的类
    if (oldOver && newOverIndex !== oldOverIndex) {
      oldOver.classList.remove("move-up", "move-down");
    }
  }

  render() {
    const listItems = this.state.data.map((item, i) => {
      return (
        <li
          data-id={i}
          key={i}
          style={{ height: "60px", border: "solid 1px #cccccc", userSelect: 'none', borderRadius: "5px", backgroundColor: "green", color: "#ffffff", margin: '10px 30%' }}
          onDragEnd={this.dragEnd.bind(this)}
          onDragStart={this.onDragStart.bind(this)}
          onMouseDown={this.onMouseDown.bind(this)}
          onMouseUp={this.onMouseUp.bind(this)}
        >{item.data}</li>
      );
    });
    return (
      <ul onDragOver={this.dragOver.bind(this)} className="contain">
        {listItems}
      </ul>
    );
  }
}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [
        {
          data: '1'
        },

        {
          data: '2'
        },

        {
          data: '3'
        },

        {
          data: '4'
        },

        {
          data: '5'
        },

        {
          data: '6'
        }
      ]
    }
  }
  render() {
    return (
      <div>
        <List data={this.state.data} />
      </div>
    )
  }
};
