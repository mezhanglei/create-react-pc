import React, { Component, useState, useRef, useEffect } from 'react';
import "./index.less";
import Draggable from '@/components/react-free-draggable';
import Button from '@/components/button';
import DragResize from '@/components/react-resize-zoom';
import { DraggableAreaGroup, DraggerItem } from "@/components/react-dragger-sort";
import VirtualList from '@/components/react-mini-virtual-list';
import { DragMoveHandle } from '@/components/react-dragger-sort/utils/types';
import { arrayMove } from '@/utils/array';

const DraggableAreaGroups = new DraggableAreaGroup();
const DraggableArea1 = DraggableAreaGroups.addArea()
const DraggableArea2 = DraggableAreaGroups.addArea()

const Demo1: React.FC<any> = (props) => {
    const [dataSource, setDataSource] = useState<any>([]);
    const [width, setWidth] = useState<any>(100);
    const [height, setHeight] = useState<any>(200);
    const [axis, setAxis] = useState<any>('both');

    const [arrDrag1, setArrDrag1] = useState<any>([1, 2, 3, 5, 6, 7, 8])
    const [arrDrag2, setArrDrag2] = useState<any>([1, 2, 3, 5, 6, 7, 8])

    const [x, setX] = useState<any>(10);
    const [y, setY] = useState<any>(10);
    const arrRef = useRef<any>(arrDrag1)

    const onDrag = (e, data) => {
        // setX(data?.x)
        // setY(data?.y)
    }


    useEffect(() => {
        setTimeout(() => {
            setDataSource([...new Array(100).keys()])
        }, 500);
    }, [])

    const renderItem = (item: any, index: number) => {
        return (
            <div className="Row" key={index}>
                Row #{item}
            </div>
        );
    };

    const onDragMove1: DragMoveHandle = (tag, coverChild, preIndex, nextIndex) => {
        if(preIndex !== undefined && nextIndex !== undefined) {
            const newArr = arrayMove(arrRef.current, preIndex, nextIndex);
            arrRef.current = newArr;
            setArrDrag1(newArr);
        }
    }

    const onDragMove2: DragMoveHandle = (tag, coverChild, e) => {

    }

    const area1Change = (info) => {
        if (info?.type === 'out') {
        }
    }

    const area2Change = (info) => {
        if (info?.type === 'in') {
            // setArrDrag2([1, 1, 2, 3, 5, 6, 7, 8])
        }
    }

    return (
        <>
            <div className="boxs" style={{ display: 'inline-block', marginLeft: '100px',marginTop: '100px', width: '500px', background: "red" }}>
                <Draggable
                    axis="both"
                    bounds=".boxs"
                    dragNode=".handle"
                    x={x}
                    y={y}
                    onDrag={onDrag}
                    grid={[100, 25]}
                    scale={1}
                >
                    <div style={{ display: "inline-block", width: '200px', background: 'blue' }}>
                        <Button className="handle" type="default">
                            拖拽元素1
                        </Button>
                    </div>
                </Draggable>
            </div>
            <Draggable
                axis="both"
                scale={1}
            >
                <div>
                    <Button className="handles" type="default">
                        拖拽元素2
                    </Button>
                </div>
            </Draggable>
            <DraggableArea1 onChange={area1Change} className="flex-box" onDragMoveEnd={onDragMove1}>
                {
                    arrDrag1?.map((item, index) => {
                        return (
                            <DraggerItem className="drag-a" key={item}>
                                <div>
                                    大小拖放{item}
                                </div>
                            </DraggerItem>
                        )
                    })
                }
            </DraggableArea1>
            <div style={{ marginTop: '10px' }}>
                <DraggableArea2 onChange={area2Change} className="flex-box" onDragMove={onDragMove2}>
                    {
                        arrDrag2?.map((item, index) => {
                            return (
                                <DraggerItem className="drag-a" key={item}>
                                    <div>
                                        大小拖放{item}
                                    </div>
                                </DraggerItem>
                            )
                        })
                    }
                </DraggableArea2>
            </div>

            <div>
                大小拖放
                <DragResize>
                    <div style={{ width: '50px', height: "50px", background: "red" }}>
                        大小拖放2
                    </div>
                </DragResize>
            </div>
            <VirtualList
                width="auto"
                // scrollToAlignment="start"
                // scrollToIndex={30}
                scrollOffset={500}
                limit={200}
                dataSource={dataSource}
                renderItem={renderItem}
                itemSize={50}
                className="VirtualList"
            />
        </>
    );
}

export default Demo1;