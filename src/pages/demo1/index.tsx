import React, { Component, useState, useRef, useEffect } from 'react';
import "./index.less";
import Draggable from '@/components/react-free-draggable';
import Button from '@/components/button';
import DragResize from '@/components/react-resize-zoom';


const Demo1: React.FC<any> = (props) => {
    const [width, setWidth] = useState<any>(100);
    const [height, setHeight] = useState<any>(200);

    const [x, setX] = useState<any>(10);
    const [y, setY] = useState<any>(10);

    const onDragStop = (e, data) => {
        setX(500)
    }

    return (
        <>
            <div className="boxs" style={{ display: 'inline-block', width: '500px', background: "red" }}>
                <Draggable
                    axis="both"
                    boundsParent=".boxs"
                    dragNode=".handle"
                    x={x}
                    y={y}
                    grid={[100, 25]}
                    onDrag={onDragStop}
                    scale={1}
                >
                    <div style={{ display: "inline-block" }}>
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
            <Draggable
                x={x}
                y={y}
                axis="both"
                onDragStop={onDragStop}
                scale={1}
            >
                <DragResize width={width} height={height}>
                    <div style={{ width: '50px', height: "50px", background: "red" }}>
                        大小拖放
                    </div>
                </DragResize>
            </Draggable>
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