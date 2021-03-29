import React, { Component, useState, useRef, useEffect } from 'react';
import "./index.less";
import Draggable from '@/components/react-free-draggable';
import Button from '@/components/button';
import DragResize from '@/components/react-resize-zoom';


const Demo1: React.FC<any> = (props) => {
    const nodeRef = useRef<any>();
    useEffect(() => {
        console.log(nodeRef.current, 111111111111111111)
    }, [])

   
    return (
        <>
            <div className="boxs" style={{ display: 'inline-block', width: '500px', background: "red" }}>
                <Draggable
                    ref={nodeRef}
                    axis="both"
                    boundsParent=".boxs"
                    dragNode=".handle"
                    position={{ x: 10, y: 10 }}
                    grid={[100, 25]}
                    scale={1}
                >
                    <div style={{ display: "inline-block" }}>
                        <Button className="handle" type="default">
                            拖拽元素1
                        </Button>
                    </div>
                </Draggable>
                <Draggable
                    axis="both"
                    dragNode=".handles"
                    position={{ x: 0, y: 0 }}
                    grid={[100, 25]}
                    scale={1}
                >
                    <div style={{ display: "inline-block" }}>
                        <Button className="handles" type="default">
                            拖拽元素2
                        </Button>
                    </div>
                </Draggable>
            </div>

            <div>
                大小拖放
                <DragResize>
                    <div style={{ width: '50px', height: "50px", background: "red" }}>
                        大小拖放
                    </div>
                </DragResize>
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