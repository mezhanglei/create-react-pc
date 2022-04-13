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

  const indexToArray = (pathStr?: string) => pathStr ? `${pathStr}`.split('.').map(n => +n) : [];

  const setChildren = (treeData: any, data: any, pathStr?: string) => {
    const pathArr = indexToArray(pathStr);
    treeData = klona(treeData);
    let parent: any;
    pathArr.forEach((item, index) => {
      if (index == 0) {
        parent = treeData[item];
      } else {
        parent = parent.children[item];
      }
    });
    parent.children = data;
    return treeData;
  };

  // 添加新元素(有副作用，会改变传入的data数据)
  const addDragItem = (data: any[], dragItem: any, dropIndex?: number, groupPath?: string) => {
    const dropContainer = groupPath ? getItem(data, groupPath) : data;
    const item = dragItem instanceof Array ? { children: dragItem } : dragItem;
    // 插入
    if (dropIndex) {
      dropContainer?.splice(dropIndex, 0, item);
      // 末尾添加
    } else {
      dropContainer?.push(item);
    }
    return data;
  };

  // 移除拖拽元素(有副作用, 会改变传入的data数据)
  const removeDragItem = (data: any[], dragIndex: number, groupPath?: string) => {
    const dragContainer = groupPath ? getItem(data, groupPath) : data;
    dragContainer?.splice(dragIndex, 1);
    return data;
  };

  // 根据路径获取指定路径的元素
  const getItem = (data: any[], path?: string) => {
    const pathArr = indexToArray(path);
    // 嵌套节点删除
    let temp: any;
    if (pathArr.length === 0) {
      return data;
    }
    pathArr.forEach((item, index) => {
      if (index === 0) {
        temp = data[item];
      } else {
        temp = temp?.children?.[item];
      }
    });
    if (temp.children) return temp.children;
    return temp;
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
      setData(addAfterData);
    } else {
      // 添加新元素
      const addAfterData = addDragItem(cloneData, dragItem, dropIndex, dropGroupPath);
      // 减去拖拽的元素
      const newData = removeDragItem(addAfterData, dragIndex, dragGroupPath);
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
