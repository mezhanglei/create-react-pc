import React, { Component, useState, useRef, useEffect } from 'react';
import "./index.less";
import Draggable from '@/components/react-free-draggable';
import Button from '@/components/button';
import DndSortable, { DndHandle, arraySwap, DndProps } from "@/components/react-dragger-sort";
import { renderToStaticMarkup } from 'react-dom/server';
import demo2 from '../demo2';
import { GetUrlRelativePath } from '@/utils/url';
import { exportWord } from '@/components/export-word';
import { addDragItem, getItem, indexToArray, removeDragItem } from './utils';
import { deepClone } from '@/utils/object';

const Demo1: React.FC<any> = (props) => {
  const [x, setX] = useState<any>(10);
  const [y, setY] = useState<any>(10);
  const [data, setData] = useState([
    { backgroundColor: 'blue', children: [{ label: 1, backgroundColor: 'green', children: [{ label: 1 }, { label: 2 }, { label: 3 }, { label: 4 }, { label: 5 }] }, { label: 2 }, { label: 3 }, { label: 4 }, { label: 5 }] },
    { backgroundColor: 'green', children: [{ label: 6 }, { label: 7 }, { label: 8 }, { label: 9 }, { label: 10 }] },
    { backgroundColor: 'green', children: [{ label: 11 }, { label: 12 }, { label: 13 }, { label: 14 }, { label: 15 }] }
  ]);

  // 1. useEffect依赖问题, 依赖为引用类型的时候，然后又去重新设置该依赖值，就会陷入死循环。
  // 2. 闭包问题：针对原生事件的订阅，可以用函数作为useEffect的依赖就可以解决闭包问题。还有其他的发布订阅之类的。
  // 3. 函数作为依赖，经常会伴随useCallback包裹，如果useCallBack不生效，可能你的组件需要memo配合。

  const onMove = (e, data) => {
    // setX(data?.x)
    // setY(data?.y)
  };

  const onClick = () => {
    exportWord({
      imgList: [
        'http://bhyf-file.oss-cn-hangzhou.aliyuncs.com/4578/1636526930976_4fb0c795.jpeg',
        'https://img-cloud.youjiaoyun.net/mp/0a802a40-4a4b-4121-aa88-1fc6367a7410.jpg'
      ]
    });
  };

  const onUpdate: DndProps['onUpdate'] = (params) => {
    const { from, to } = params;
    console.log(params, '同区域');
    const dragIndex = from?.index;
    let dropIndex = to?.index;
    const fromGroup = from?.group;
    const fromCollection = fromGroup?.collection;
    const parentPath = fromCollection?.path;
    const cloneData = deepClone(data);
    const parent = getItem(cloneData, parentPath);
    const childs = parentPath ? parent.children : cloneData;
    dropIndex = typeof dropIndex === 'number' ? dropIndex : childs?.length;
    const swapResult = arraySwap(childs, Number(dragIndex), Number(dropIndex));
    let newData;
    if (parentPath) {
      parent.children = swapResult;
      newData = cloneData;
    } else {
      newData = swapResult;
    }
    setData(newData);
  };

  // 先计算内层的数据再计算外层的数据
  const onAdd: DndProps['onAdd'] = (params) => {
    const { from, to } = params;
    console.log(params, '跨区域');
    const cloneData = deepClone(data);
    // 拖拽区域信息
    const dragGroup = from.group;
    // 拖拽区域的额外传值
    const dragCollection = dragGroup?.collection;
    const dragIndex = from?.index;
    const dragPath = dragCollection?.path ? `${dragCollection?.path}.${dragIndex}` : `${dragIndex}`;
    const dragItem = getItem(cloneData, dragPath);
    // 拖放区域的信息
    const dropGroup = to?.group;
    // 额外传值
    const dropCollection = dropGroup?.collection;
    const dropIndex = to?.index;
    const dragIndexPathArr = indexToArray(dragCollection?.path);
    const dropIndexPathArr = indexToArray(dropCollection?.path);
    // 先计算内部的变动，再计算外部的变动
    if (dragIndexPathArr?.length > dropIndexPathArr?.length || !dropIndexPathArr?.length) {
      const removeData = removeDragItem(cloneData, dragIndex, dragCollection?.path);
      const addAfterData = addDragItem(removeData, dragItem, dropIndex, dropCollection?.path);
      setData(addAfterData);
    } else {
      const addAfterData = addDragItem(cloneData, dragItem, dropIndex, dropCollection?.path);
      const newData = removeDragItem(addAfterData, dragIndex, dragCollection?.path);
      setData(newData);
    }
  };

  const loopChildren = (arr: any[], parent?: string) => {
    return arr.map((item, index) => {
      const path = parent === undefined ? String(index) : `${parent}.${index}`;
      if (item.children) {
        return (
          <div key={index}>
            <DndSortable
              options={{
                childDrag: true,
                allowDrop: true,
                allowSort: true
              }}
              collection={{ path: path }}
              style={{ display: 'flex', flexWrap: 'wrap', background: item.backgroundColor, width: '200px', marginTop: '10px' }}
              onUpdate={onUpdate}
              onAdd={onAdd}
            >
              {loopChildren(item.children, path)}
            </DndSortable>
          </div>
        );
      }
      return (<div style={{ width: '50px', height: '50px', backgroundColor: 'red', border: '1px solid green' }} key={path}>{item.label}</div>);
    });
  };

  return (
    <div className="boxx" style={{ marginTop: '0px' }}>
      <div className="boxs" style={{ display: 'inline-block', marginLeft: '10px', marginTop: '10px', width: '500px', background: "red" }}>
        <Draggable
          bounds=".boxs"
          handle=".handle"
          x={x}
          y={y}
          onMove={onMove}
          scale={1}
        >
          <div style={{ display: "inline-block", width: '200px', background: 'blue' }}>
            <Button className="handle" type="default">
              拖拽元素
            </Button>
          </div>
        </Draggable>
      </div>
      <DndSortable
        onUpdate={onUpdate}
        onAdd={onAdd}
        options={{
          childDrag: true,
          allowDrop: true,
          allowSort: true
        }}>
        {loopChildren(data)}
      </DndSortable>
      <Button onClick={onClick}>
        导出
      </Button>
    </div>
  );
};

export default Demo1;
