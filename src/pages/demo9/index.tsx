import { arrayMove } from '@/utils/array';
import { insertAfter, insertBefore } from '@/utils/dom';
import React from 'react';
import { getIndex } from './utils';
import anime from 'animejs';

class List extends React.Component {
  dragged: any;
  over: any;
  cloneDragged: any;
  constructor(props) {
    super(props);
    this.dragged = null;
    this.state = { ...props };
  }

  dragStart(e: any) {
    this.dragged = e.currentTarget;
    this.cloneDragged = this.dragged.cloneNode(true);
  }

  // 会触发
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
      // 重置
      dragged.style.display = 'block';
      over.classList.remove("move-up");
      over.classList.remove("move-down");
      cloneDragged.parentNode.removeChild(cloneDragged);
    }
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
    }
    dragged.style.display = "none";

    // 避免触发对象为外面容器
    if (newOver.tagName !== "LI" || dragged == newOver) {
      return;
    }
    // 比较当前的项的序号
    const originIndex = getIndex(dragged, cloneDragged);
    const dgIndex = getIndex(cloneDragged, dragged);
    const newOverIndex = getIndex(newOver, dragged);
    const oldOverIndex = getIndex(oldOver, dragged);
    let animateName;
    if (typeof dgIndex !== 'number' || typeof newOverIndex !== 'number' || typeof originIndex !== 'number') return;
    // over目标向下移动
    if (dgIndex > newOverIndex) {
      animateName = "move-down";
      // over目标向上移动
    } else if (dgIndex < newOverIndex) {
      animateName = "move-up";
    }
    // 如果需要交换则添加交换类名
    if (animateName && !newOver.classList.contains(animateName)) {
      if (animateName == 'move-down') {
        anime.set(newOver, { translateY: 0 })
        anime.set(cloneDragged, { translateY: 0 })
        anime({
          targets: newOver,
          translateY: 70,
          duration: 200,
          easing: 'linear'
        });
        anime({
          targets: cloneDragged,
          translateY: -70,
          duration: 200,
          easing: 'linear',
          complete: function (anim) {
            anime.set(newOver, { translateY: 0 })
            anime.set(cloneDragged, { translateY: 0 })
            insertBefore(cloneDragged, newOver);
          }
        });
      } else {
        anime.set(newOver, { translateY: 0 })
        anime.set(cloneDragged, { translateY: 0 })
        anime({
          targets: newOver,
          translateY: -70,
          duration: 200,
          easing: 'linear'
        });
        anime({
          targets: cloneDragged,
          translateY: 70,
          duration: 200,
          easing: 'linear',
          complete: function (anim) {
            anime.set(newOver, { translateY: 0 })
            anime.set(cloneDragged, { translateY: 0 })
            insertAfter(cloneDragged, newOver);
          }
        });
      }
      console.log(dgIndex, newOverIndex)
      // 添加动画
      newOver.classList.add(animateName);
      this.over = newOver;
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
          style={{ height: "60px", border: "solid 1px #cccccc", margin: "10px 30%", borderRadius: "5px", backgroundColor: "green", color: "#ffffff" }}
          draggable='true'
          onDragEnd={this.dragEnd.bind(this)}
          onDragStart={this.dragStart.bind(this)}
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
