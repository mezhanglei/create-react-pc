import { arrayMove } from '@/utils/array';
import { css, getChildrenIndex, insertAfter, insertBefore } from '@/utils/dom';
import React from 'react';
import anime from 'animejs';
import { isEventTouch } from '@/utils/verify';
import { MouseButton } from '@/utils/mouse';
import { klona } from 'klona';
import { _animate } from './utils';

const OverClass = {
  pre: 'over-pre',
  next: 'over-next'
}
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
  componentDidMount() {
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
    // dataTransfer.setData把拖动对象的数据存入其中，可以用dataTransfer.getData来获取数据
    e.dataTransfer.setData("data", e.target.innerText);
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
    const from = getChildrenIndex(dragged, cloneDragged);
    const to = getChildrenIndex(cloneDragged, dragged);
    if (typeof from === 'number' && typeof to === 'number') {
      data = arrayMove(data, from, to);
      this.setState({ data: data });
    }
    // 重置
    dragged.draggable = undefined;
    dragged.style.display = this.lastDisplay;
    over?.classList?.remove(OverClass.pre, OverClass.next);
    cloneDragged.parentNode.removeChild(cloneDragged);
  }

  dragOver(e: any) {
    e.preventDefault();
    const dragged = this.dragged;
    const cloneDragged = this.cloneDragged;
    const newOver = e.target;
    const oldOver = this.over;
    // 添加拖拽副本
    if (dragged.style.display !== "none") {
      insertAfter(cloneDragged, dragged);
    }
    dragged.style.display = "none";
    // 触发目标排除直接父元素与元素本身
    if (newOver.tagName !== "LI" || newOver === dragged) {
      return;
    }
    // 只允许一个动画
    if (newOver?.animated) return;
    // 更换之前的初始位置
    const newOverPreRect = newOver.getBoundingClientRect();
    const draggedPreRect = cloneDragged.getBoundingClientRect();
    // 位置切换
    const draggedIndex = getChildrenIndex(cloneDragged, dragged);
    const newOverIndex = getChildrenIndex(newOver, dragged);
    const oldOverIndex = getChildrenIndex(oldOver, dragged);
    if (draggedIndex < newOverIndex) {
      insertAfter(cloneDragged, newOver);
      newOver.classList.add(OverClass.pre);
      this.over = newOver;
    } else {
      // 目标比元素小，插到其前面
      insertBefore(cloneDragged, newOver);
      newOver.classList.add(OverClass.next);
      this.over = newOver;
    }
    // 添加动画
    _animate(cloneDragged, draggedPreRect);
    _animate(newOver, newOverPreRect);
    if (oldOver && newOverIndex !== oldOverIndex) {
      oldOver.classList.remove(OverClass.pre, OverClass.next);
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
