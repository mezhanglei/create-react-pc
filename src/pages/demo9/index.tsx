import { arrayMove } from '@/utils/array';
import React from 'react';
import './index.less';

class List extends React.Component {
  dragged: any;
  over: any;
  constructor(props) {
    super(props);
    this.dragged = null;
    this.state = { ...props };
  }

  dragStart(e: any) {
    this.dragged = e.currentTarget;
  }

  dragEnd(e: any) {
    const dragged = this.dragged;
    const layer = e.target;
    const over = this.over;
    // 重置样式
    dragged.style.display = 'block';
    layer.classList.remove("drag-up");
    layer.classList.remove("drag-down");
    over.classList.remove("drag-up");
    over.classList.remove("drag-down");

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
    // dragged.style.display = "none";
    if (newOver.tagName !== "LI") {
      return;
    }

    //判断当前拖拽target 和 经过的target 的 newIndex
    const dgIndex = JSON.parse(dragged.dataset.item).newIndex;
    const taIndex = JSON.parse(newOver.dataset.item).newIndex;
    let animateName;
    if (dgIndex > taIndex) {
      animateName = "drag-up";
    } else if (dgIndex < taIndex) {
      animateName = "drag-down";
    }
    console.log(dgIndex,taIndex)
    if (oldOver && newOver.dataset.item !== oldOver.dataset.item) {
      oldOver.classList.remove("drag-up", "drag-down");
    }
    if (!newOver.classList.contains(animateName)) {
      newOver.classList.add(animateName);
      this.over = newOver;
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
          data-item={JSON.stringify(item)}
        >{item.color}</li>
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
          newIndex: 1,
          color: "red"
        },

        {
          newIndex: 2,
          color: "green"
        },

        {
          newIndex: 3,
          color: "blue"
        },

        {
          newIndex: 4,
          color: "yellow"
        },

        {
          newIndex: 5,
          color: "orange"
        },

        {
          newIndex: 6,
          color: "black"
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
