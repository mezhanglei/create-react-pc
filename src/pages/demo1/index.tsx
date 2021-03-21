import React, { Component, useState, useRef, useEffect } from 'react';
import "./index.less";
import Draggable from '@/components/react-free-draggable';
import Button from '@/components/button';
import DragResize from '@/components/react-resize-zoom';


const Demo1: React.FC<any> = (props) => {
    return (
        <>
            <div className="boxs" style={{ display: 'inline-block', width: '500px', background: "red" }}>
                <Draggable
                    axis="both"
                    boundsParent=".boxs"
                    dragNode=".handle"
                    position={{ x: 10, y: 10 }}
                    grid={[100, 25]}
                    scale={1}
                >
                    <div style={{ display: "inline-block" }}>
                        <Button className="handle" type="default">
                            拖拽元素
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
            </div>
        </>
    );
}

export default Demo1;