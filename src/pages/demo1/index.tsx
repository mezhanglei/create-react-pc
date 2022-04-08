import React, { Component, useState, useRef, useEffect } from 'react';
import "./index.less";
import Draggable from '@/components/react-free-draggable';
import Button from '@/components/button';
import DndSortable, { arrayMove } from "@/components/react-dragger-sort";
import { DragMoveHandle } from '@/components/react-dragger-sort/utils/types';
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

  const indexToArray = (pathStr: string) => `${pathStr}`.split('.').map(n => +n);

  const getLastIndex = (pathStr: string) => {
    const array = indexToArray(pathStr);
    return (array.pop()) as number;
  };

  const getItem = (path: string, data: any) => {
    const arr = indexToArray(path);
    // 嵌套节点删除
    let parent: any;
    if (arr.length === 0) {
      return data;
    }
    arr.forEach((item, index) => {
      if (index === 0) {
        parent = data[item];
      } else {
        parent = parent?.children?.[item];
      }
    });
    if (parent.children) return parent.children;
    return parent;
  };

  const setInfo = (pathStr: string, treeData: any, data: any) => {
    const arr = indexToArray(pathStr);
    treeData = klona(treeData);
    let parent: any;
    arr.forEach((item, index) => {
      if (index == 0) {
        parent = treeData[item];
      } else {
        parent = parent.children[item];
      }
    });
    parent.children = data;
    return treeData;
  };

  const getParentPath = (pathStr: string) => {
    const pathArr = pathStr?.split('.');
    pathArr?.pop();
    return pathArr?.join('.');
  }

  const onUpdate: DragMoveHandle = (params) => {
    const { source, target } = params;
    console.log(params, '同区域');
    // if (!source || !target) return;
    // const preIndex = getLastIndex(source.path);
    // const nextIndex = getLastIndex(target.path);
    // const parentPath = getParentPath(source.path);
    // let parent = parentPath ? getItem(parentPath, data) : data;
    // if (preIndex !== undefined && nextIndex !== undefined) {
    //   parent = arrayMove(parent, Number(preIndex), Number(nextIndex));
    //   const newData = parentPath ? setInfo(parentPath, data, parent) : parent;
    //   setData(newData);
    // }
  };

  const onAdd: DragMoveHandle = (params) => {
    const { source, target } = params;
    console.log(params, '跨区域');
    if (!source || !target) return;
    // const sourceData = getItem(source.path, data);
    // const targetData = getItem(target.path, data);
    // const sourceIndex = getLastIndex(source.path);
    // let targetIndex;
    // if (target.path && target.path === target.path) {
    //   targetIndex = targetData?.length;
    // } else {
    //   targetIndex = getLastIndex(target.path);
    // }
    // if (sourceIndex >= 0 && targetIndex >= 0) {
    //   targetData?.splice(targetIndex + 1, 0, sourceData?.[sourceIndex]);
    //   sourceData?.splice(sourceIndex, 1);
    //   // add
    //   const afterAdd = setInfo(target.path, data, targetData);
    //   // remove
    //   const newData = setInfo(source.path, afterAdd, sourceData);
    //   setData(newData);
    // }
  };

  const loopChildren = (arr: any[]) => {
    return arr.map((item, index) => {
      if (item.children) {
        return (
          <div data-id={index} key={index} style={index === 1 ? { padding: '10px 10px 20px 10px', background: 'gray', display: 'inline-block' } : {}}>
            <DndSortable
              options={{
                group: 'group1',
                childDrag: true,
                allowDrop: true
              }}
              style={{ display: 'flex', flexWrap: 'wrap', background: item.backgroundColor, width: '200px', marginTop: '10px' }}
              onUpdate={onUpdate}
              onAdd={onAdd}
            >
              {loopChildren(item.children)}
            </DndSortable>
          </div>
        );
      }
      return (<div data-id={index} style={{ width: '50px', height: '50px', backgroundColor: 'red', border: '1px solid green' }} key={item.label}>{item.label}</div>);
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
        options={{
          group: 'group1',
          childDrag: true,
          allowDrop: true
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
