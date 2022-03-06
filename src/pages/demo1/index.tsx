import React, { Component, useState, useRef, useEffect } from 'react';
import "./index.less";
import Draggable from '@/components/react-free-draggable';
import Button from '@/components/button';
import DndArea, { DndContextProvider, arrayMove, deepSet } from "@/components/react-dragger-sort";
import { DragMoveHandle } from '@/components/react-dragger-sort/utils/types';
import { renderToStaticMarkup } from 'react-dom/server';
import demo2 from '../demo2';
import { GetUrlRelativePath } from '@/utils/url';
import { exportWord } from '@/components/export-word';

const Demo1: React.FC<any> = (props) => {
  const [x, setX] = useState<any>(10);
  const [y, setY] = useState<any>(10);
  const [data, setData] = useState([
    { list: [1, 2, 3, 4, 5, 6, 7], backgroundColor: 'blue' },
    { list: [8, 9, 10, 11, 12, 13, 14], backgroundColor: 'green' }
  ]);

  const onDrag = (e, data) => {
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


  const onDragEnd: DragMoveHandle = (params) => {
    const { source, target } = params;
    const sourceItem = source.item;
    const targetItem = target?.item;
    if (!source.area || !target?.area || !targetItem) return;
    let sourceCollect = source?.collect as any;
    const preIndex = sourceItem.path?.split('.')?.pop();
    const nextIndex = targetItem.path?.split('.')?.pop();
    const sourceDataPath = source.path;
    if (preIndex !== undefined && nextIndex !== undefined) {
      const newItem = arrayMove(sourceCollect, Number(preIndex), Number(nextIndex));
      const newData = deepSet(data, sourceDataPath, newItem);
      setData(newData);
    }
  };

  const onAreaDropEnd: DragMoveHandle = (params) => {
    const { source, target } = params;
    const sourceItem = source.item;
    const targetItem = target?.item;
    if (!source.area || !target?.area) return;
    let sourceCollect = source?.collect as any;
    let targetCollect = target?.collect as any;
    const sourceIndex = sourceItem.path && Number(sourceItem.path?.split('.')?.pop());
    const sourceDataPath = source.path;
    const targetIndex = targetItem ? targetItem.path && Number(targetItem?.path?.split('.')?.pop()) : targetCollect?.length;
    const targetDataPath = target.path;
    if (sourceIndex >= 0 && targetIndex >= 0) {
      targetCollect?.splice(targetIndex + 1, 0, sourceCollect?.[sourceIndex]);
      sourceCollect?.splice(sourceIndex, 1);
      // remove
      const tmp = deepSet(data, sourceDataPath, sourceCollect);
      // add
      const newData = deepSet(tmp, targetDataPath, targetCollect);
      setData(newData);
    }
  }

  const renderChildren = (list: any[]) => {
    return list?.map((areaItem, areaIndex) => {
      return (
        <DndArea key={areaIndex} collect={areaItem?.list} id={`${areaIndex}.list`} style={{ display: 'flex', flexWrap: 'wrap', background: areaItem.backgroundColor, width: '200px', marginTop: '10px' }}>
          {
            areaItem?.list?.map((item, index) => {
              return (
                <DndArea.Item style={{ width: '50px', height: '50px', backgroundColor: 'red', border: '1px solid green' }} key={item} id={index}>
                  <div>
                    {item}
                  </div>
                </DndArea.Item>
              );
            })
          }
        </DndArea>
      )
    })
  }

  return (
    <div className="boxx" style={{ marginTop: '0px' }}>
      <div className="boxs" style={{ display: 'inline-block', marginLeft: '10px', marginTop: '10px', width: '500px', background: "red" }}>
        <Draggable
          bounds=".boxs"
          handle=".handle"
          x={x}
          y={y}
          onDrag={onDrag}
          scale={1}
        >
          <div style={{ display: "inline-block", width: '200px', background: 'blue' }}>
            <Button className="handle" type="default">
              拖拽元素v1
            </Button>
          </div>
        </Draggable>
      </div>
      <DndContextProvider onDragEnd={onDragEnd} onAreaDropEnd={onAreaDropEnd}>
        {renderChildren(data)}
      </DndContextProvider>
      <Button onClick={onClick}>
        导出
      </Button>
    </div>
  );
};

export default Demo1;
