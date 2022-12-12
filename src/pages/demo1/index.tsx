import React, { Component, useState, useRef, useEffect } from 'react';
import "./index.less";
import Draggable from '@/components/react-free-draggable';
import Button from '@/components/button';
import DndSortable, { DndHandle, arrayMove, DndProps } from "@/components/react-dragger-sort";
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

  const onMove = (e, data) => {
    // setX(data?.x)
    // setY(data?.y)
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
    const moveResult = arrayMove(childs, Number(dragIndex), Number(dropIndex));
    let newData;
    if (parentPath) {
      parent.children = moveResult;
      newData = cloneData;
    } else {
      newData = moveResult;
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
      if (item?.children) {
        return (
          <div key={index}>
            <DndSortable
              options={{
                // hiddenFrom: true
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
      return (<div style={{ width: '50px', height: '50px', backgroundColor: 'red', border: '1px solid green' }} key={path}>{item?.label}</div>);
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
      >
        {loopChildren(data)}
      </DndSortable>
    </div>
  );
};

export default Demo1;
