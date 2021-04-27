import React, { Component, useState, useRef, useEffect } from 'react';
import "./index.less";
import Draggable from '@/components/react-free-draggable';
import Button from '@/components/button';
import DragResize from '@/components/react-resize-zoom';
import { DraggableArea, DraggableAreaGroup, DraggerItem } from "@/components/react-dragger-sort";


const Demo1: React.FC<any> = (props) => {
    const [width, setWidth] = useState<any>(100);
    const [height, setHeight] = useState<any>(200);
    const [axis, setAxis] = useState<any>('both');

    const [x, setX] = useState<any>(10);
    const [y, setY] = useState<any>(10);

    const onDrag = (e, data) => {
        // setX(data?.x)
    }

    return (
        <>
            <div className="boxs" style={{ display: 'inline-block', width: '500px', background: "red" }}>
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
            <DraggableArea className="flex-box">
                {
                    [1, 2, 3, 5, 6, 7, 8]?.map((item, index) => {
                        return (
                            <DraggerItem className="drag-a" key={item} id={item}>
                                <div>
                                    大小拖放
                            </div>
                            </DraggerItem>
                        )
                    })
                }
            </DraggableArea>

            <div>
                大小拖放
                <DragResize>
                    <div style={{ width: '50px', height: "50px", background: "red" }}>
                        大小拖放2
                    </div>
                </DragResize>
            </div>
        </>
    );
}

export default Demo1;