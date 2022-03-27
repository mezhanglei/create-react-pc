import { arrayMove } from '@/utils/array';
import { insertAfter, insertBefore } from '@/utils/dom';
import React from 'react';
import './index.less';

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
    // 目标元素
    const over = this.over;
    // 重置样式
    dragged.style.display = 'block';
    over.classList.remove("move-up");
    over.classList.remove("move-down");

    this.cloneDragged.parentNode.removeChild(this.cloneDragged);

    let data = this.state.data;
    const from = Number(dragged.dataset.id);
    const to = Number(over.dataset.id);
    data = arrayMove(data, from, to);
    this.setState({ data: data });
  }

  dragOver(e: any) {
    e.preventDefault();
    const dragged = this.dragged;
    const oldOver = this.over;
    const newOver = e.target;
    dragged.style.display = "none";
    if (newOver.tagName !== "LI") {
      return;
    }

    // 比较当前的项的序号
    const dgIndex = Number(dragged.dataset.id);
    const newOverIndex = Number(newOver.dataset.id);
    const oldOverIndex = oldOver && Number(oldOver.dataset.id);
    let animateName;
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
        insertBefore(this.cloneDragged, newOver);
      } else {
        insertAfter(this.cloneDragged, newOver);
      }
      newOver.classList.add(animateName);
      this.over = newOver;
    }
    // 经过新的项则清除旧的项的类
    if (oldOver && newOverIndex !== oldOverIndex) {
      oldOver.classList.remove("move-up", "move-down");
    }
  }

  render() {
    var listItems = this.state.data.map((item, i) => {
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
