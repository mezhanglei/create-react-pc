import React, { Component, useState, useEffect } from 'react';
import "./index.less";
import Draggable from '@/components/react-free-draggable';
import Button from '@/components/button';


const Demo1: React.FC<any> = (props) => {

    return (
        <>
            <div className="boxs" style={{ display: 'inline-block', width: '500px', background: "red" }}>
                <Draggable
                    axis="both"
                    boundsParent=".boxs"
                    dragNode=".handle"
                    position={{ x: 10, y: 0 }}
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
            
        </>
    );
}

export default Demo1;