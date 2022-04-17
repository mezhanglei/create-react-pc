import React, { Component } from 'react';
import { Rate, Input, DatePicker, Tag } from 'antd';
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
import { klona } from 'klona';
import DndSortable, { arrayMove, DndProps } from '@/components/react-dragger-sort';
import { addDragItem, getItem, indexToArray, removeDragItem, setChildren, uniqueId } from './utils';

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
        name: 'Input',
        attr: {
          size: 'large',
          value: '第一个'
        }
      }],
    };
  }

  componentDidMount() {

  }

  onUpdate: DndProps['onUpdate'] = (params) => {
    const { drag, drop } = params;
    console.log(params, '同区域');
    const { data } = this.state;
    const dragIndex = drag?.index;
    const dropIndex = drop?.dropIndex;
    const parentPath = drag?.groupPath;
    let parent = parentPath ? getItem(data, parentPath) : data;
    parent = arrayMove(parent, Number(dragIndex), Number(dropIndex));
    const newData = parentPath ? setChildren(data, parent, parentPath) : parent;
    this.setState({ data: newData });
  }

  onAdd: DndProps['onAdd'] = (params) => {
    const { drag, drop } = params;
    console.log(params, '跨区域');
    const { data } = this.state;
    const cloneData = klona(data);
    // 容器外面添加进来
    if (drag?.groupPath === 'components') {
      // 拖拽项
      let dragItem = getItem(soundData, `${drag?.index}`);
      dragItem = dragItem?.name === 'Containers' ? { children: [], ...dragItem } : dragItem;
      // 放置项
      const dropGroupPath = drop.groupPath;
      const dropIndex = drop?.dropIndex;
      const newData = addDragItem(cloneData, dragItem, dropIndex, dropGroupPath);
      this.setState({
        data: newData
      });
      // 容器内部拖拽
    } else {
      // 拖拽区域信息
      const dragGroupPath = drag.groupPath;
      const dragIndex = drag?.index;
      const dragPath = drag?.path;
      const dragItem = getItem(cloneData, dragPath);
      // 拖放区域的信息
      const dropGroupPath = drop.groupPath;
      const dropIndex = drop?.dropIndex;
      const dropPath = drop?.path;
      const dragIndexPathArr = indexToArray(dragPath);
      const dropIndexPathArr = indexToArray(dropPath || dropGroupPath);
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

  render() {

    const loopChildren = (arr: any[], parent?: string) => {
      return arr.map((item, index) => {
        const path = parent === undefined ? String(index) : `${parent}.${index}`;
        if (item.children) {
          return (
            <div {...item.attr} key={uniqueId()}>
              <DndSortable
                options={{
                  groupPath: path,
                  childDrag: true,
                  allowDrop: true,
                  allowSort: true
                }}
                style={{
                  minHeight: 100,
                  margin: 10,
                }}
                onUpdate={this.onUpdate}
                onAdd={this.onAdd}
              >
                {loopChildren(item.children, path)}
              </DndSortable>
            </div>
          );
        }
        const ComponentInfo = GlobalComponent[item.name];
        return (<div key={path}><ComponentInfo {...item.attr} /></div>);
      });
    };

    return (
      <>
        <h2>组件列表</h2>
        <DndSortable
          options={{
            groupPath: 'components',
            childDrag: true,
            allowDrop: false,
            allowSort: false
          }}
        >
          {
            soundData.map(item => {
              return <div data-id={item.name}><Tag>{item.name}</Tag></div>
            })
          }
        </DndSortable>
        <h2>容器</h2>
        <DndSortable
          options={{
            childDrag: true,
            allowDrop: true,
            allowSort: true
          }}
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
