import React, { Component, useState, useRef, useEffect } from 'react';
import "./index.less";
import Draggable from '@/components/react-free-draggable';
import Button from '@/components/button';
import DndSortable, { DndHandle, arrayMove, DndProps } from "@/components/react-dragger-sort";
import { renderToStaticMarkup } from 'react-dom/server';
import demo2 from '../demo2';
import { GetUrlRelativePath } from '@/utils/url';
import { exportWord } from '@/components/export-word';
import { klona } from 'klona';
import { getItem, getParent, indexToArray, itemAdd, itemRemove, setChildren } from './utils';

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

  const onClick = () => {
    exportWord({
      imgList: [
        'http://bhyf-file.oss-cn-hangzhou.aliyuncs.com/4578/1636526930976_4fb0c795.jpeg',
        'https://img-cloud.youjiaoyun.net/mp/0a802a40-4a4b-4121-aa88-1fc6367a7410.jpg'
      ]
    });
  };

  const onUpdate: DndProps['onUpdate'] = (params) => {
    const { drag, drop } = params;
    console.log(params, '同区域');
    const dragIndex = drag?.index;
    const dropIndex = drop?.dropIndex;
    const parentPath = drag?.groupPath;
    let parent = parentPath ? getItem(data, parentPath) : data;
    parent = arrayMove(parent, Number(dragIndex), Number(dropIndex));
    const newData = parentPath ? setChildren(data, parent, parentPath) : parent;
    setData(newData);
  };

  // 先计算内层的数据再计算外层的数据
  const onAdd: DndProps['onAdd'] = (params) => {
    const { drag, drop } = params;
    console.log(params, '跨区域');
    const cloneData = klona(data);
    const dragIndexPathArr = indexToArray(drag.path);
    const dropIndexPathArr = indexToArray(drop?.path);
    // 当从内部往外部拖拽时
    if (dragIndexPathArr?.length > dropIndexPathArr?.length) {
      const dragItem = getItem(cloneData, drag.path);
      let newTreeData = itemRemove(cloneData, drag.path);
      // 添加拖拽元素
      newTreeData = itemAdd(newTreeData, dragItem, drop.path);
    } else {
      const dragItem = getItem(cloneData, drag.path);
      // 添加拖拽元素
      let newData = itemAdd(cloneData, dragItem, drop.path);
      // 删除元素 获得新数据
      newData = itemRemove(newData, drag?.path);
    }
    // const dragParentPath = drag.groupPath;
    // const dragParent = dragParentPath ? getItem(cloneData, dragParentPath) : cloneData;
    // const dragItem = getItem(cloneData, drag.path);
    // const dragIndex = drag?.index;
    // // 拖放区域的路径
    // const dropParentPath = drop.groupPath;
    // const dropParent = dropParentPath ? getItem(cloneData, dropParentPath) : cloneData;
    // const dropIndex = drop?.dropIndex;
    // // 在drop中指定位置插入新的元素
    // if (drop?.item) {
    //   if (dragItem instanceof Array) {
    //     dropParent?.splice(dropIndex, 0, { children: dragItem });
    //   } else {
    //     dropParent?.splice(dropIndex, 0, dragItem);
    //   }
    // } else { // 在drop末尾添加新的元素
    //   if (dragItem instanceof Array) {
    //     dropParent?.push({ children: dragItem });
    //   } else {
    //     dropParent?.push(dragItem);
    //   }
    // }
    // let newData;
    // // add
    // if (dropParentPath) {
    //   newData = setChildren(cloneData, dropParent, dropParentPath);
    // } else {
    //   newData = dropParent;
    // }
    // remove
    // if (dragParentPath) {
    //   // newData = itemRemove(newData, drag?.path);
    // } else {
    //   // newData?.splice(dragIndex, 1);
    // }
    // setData(newData);
  };

  const loopChildren = (arr: any[], parent?: string) => {
    return arr.map((item, index) => {
      const path = parent === undefined ? String(index) : `${parent}.${index}`;
      if (item.children) {
        return (
          <div key={index} style={index === 1 ? { padding: '10px 10px 20px 10px', background: 'gray', display: 'inline-block' } : {}}>
            <DndSortable
              options={{
                group: 'group1',
                groupPath: path,
                childDrag: true,
                allowDrop: true,
                allowSort: true
              }}
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
          group: 'group1',
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
