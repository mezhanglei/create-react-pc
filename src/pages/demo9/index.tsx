import React, { Component } from 'react';
import { Rate, Input, DatePicker, Tag } from 'antd';
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
import DndSortable, { arrayMove, DndProps } from '@/components/react-dragger-sort';
import { addDragItem, getItem, indexToArray, removeDragItem, uniqueId } from './utils';
import { deepClone } from '@/utils/object';

const GlobalComponent = {
  Rate,
  Input,
  MonthPicker,
  RangePicker,
  WeekPicker,
};

const soundData = [
  {
    name: 'MonthPicker',
    attr: {}
  },
  {
    name: 'RangePicker',
    attr: {}
  },
  {
    name: 'WeekPicker',
    attr: {}
  },
  {
    name: 'Input',
    attr: {
      size: 'large',
      value: '第一个'
    }
  },
  {
    name: 'Containers',
    attr: {
      style: {
        border: '1px solid red'
      }
    },
  }
];

class Demo9 extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: [{
        name: 'Input'
      }],
    };
  }

  componentDidMount() {

  }

  onUpdate: DndProps['onUpdate'] = (params) => {
    const { from, to } = params;
    console.log(params, '同区域');
    const { data } = this.state;
    const cloneData = deepClone(data);
    const dragIndex = from?.index;
    const dropIndex = to?.index;
    const fromCollection = from?.group?.collection;
    const parentPath = fromCollection?.path;
    const parent = getItem(cloneData, parentPath);
    const childs = parentPath ? parent.children : cloneData;
    const moveResult = arrayMove(childs, Number(dragIndex), Number(dropIndex));
    let newData;
    if (parentPath) {
      parent.children = moveResult;
      newData = cloneData;
    } else {
      newData = moveResult;
    }
    this.setState({ data: newData });
  }

  onAdd: DndProps['onAdd'] = (params) => {
    const { from, to } = params;
    console.log(params, '跨区域');
    const { data } = this.state;
    const cloneData = deepClone(data);
    const fromCollection = from?.group?.collection;
    const toCollection = to?.group?.collection;
    // 容器外面添加进来
    if (fromCollection?.type === 'components') {
      // 拖拽项
      let dragItem = getItem(soundData, `${from?.index}`);
      dragItem = dragItem?.name === 'Containers' ? { children: [], ...dragItem } : dragItem;
      // 放置项
      const dropGroupPath = toCollection?.path;
      const dropIndex = to?.index;
      const newData = addDragItem(cloneData, dragItem, dropIndex, dropGroupPath);
      this.setState({
        data: newData
      });
      // 容器内部拖拽
    } else {
      // 拖拽区域信息
      const dragGroupPath = fromCollection?.path;
      const dragGroupData = getItem(cloneData, dragGroupPath)
      const dragIndex = from?.index;
      const dragItem = dragIndex && dragGroupData?.[dragIndex];
      // 拖放区域的信息
      const dropGroupPath = toCollection?.path;
      const dropIndex = to?.index;
      const dragIndexPathArr = indexToArray(dragGroupPath);
      const dropIndexPathArr = indexToArray(dropGroupPath);
      // 先计算内部的变动，再计算外部的变动
      if (dragIndexPathArr?.length > dropIndexPathArr?.length || !dropIndexPathArr?.length) {
        // 减去拖拽的元素
        const removeData = removeDragItem(cloneData, dragIndex, dragGroupPath);
        // 添加新元素
        const addAfterData = addDragItem(removeData, dragItem, dropIndex, dropGroupPath);
        this.setState({ data: addAfterData });
      } else {
        // 添加新元素
        const addAfterData = addDragItem(cloneData, dragItem, dropIndex, dropGroupPath);
        // 减去拖拽的元素
        const newData = removeDragItem(addAfterData, dragIndex, dragGroupPath);
        this.setState({ data: newData });
      }
    }
  }

  onHover = (over) => {
    over.style.opacity = '0.4';
  }

  onUnHover = (over) => {
    over.style.opacity = '1';
  }

  render() {

    const loopChildren = (arr: any[], parent?: string) => {
      return arr.map((item, index) => {
        const path = parent === undefined ? String(index) : `${parent}.${index}`;
        if (item.children) {
          return (
            <div key={uniqueId()}>
              <DndSortable
                style={{
                  minHeight: 100,
                  margin: 10,
                }}
                collection={{ path: path }}
                onUpdate={this.onUpdate}
                onAdd={this.onAdd}
              >
                {loopChildren(item.children, path)}
              </DndSortable>
            </div>
          );
        }
        const ComponentInfo = GlobalComponent[item.name];
        return (<div key={path}><ComponentInfo /></div>);
      });
    };

    return (
      <>
        <h2>组件列表</h2>
        <DndSortable
          collection={{ type: "components" }}
          options={{
            disabledDrop: false,
            disabledSort: false
          }}
        >
          {
            soundData.map((item, index) => {
              return <div key={index}><Tag>{item.name}</Tag></div>
            })
          }
        </DndSortable>
        <h2>容器</h2>
        <DndSortable
          onHover={this.onHover}
          onUnHover={this.onUnHover}
          onUpdate={this.onUpdate}
          onAdd={this.onAdd}
          style={{ display: 'inline-block', width: '500px', height: '500px', background: 'green' }}
          key={uniqueId()}
        >
          {loopChildren(this.state.data)}
        </DndSortable>
      </>
    );
  }
}

export default Demo9;
