import { DragAndDrop, useDrag, useDrop } from '@/components/react-drag';
import React, { Component, useState, useEffect, useRef } from 'react';
import "./index.less";

function DragAndDropElement(props: any): any {
    const [, setDragRef] = useDrag({
        collection: {}, // 这里可以填写任意你想传递给drop元素的消息，后面会通过参数的形式传递给drop元素
    })
    const [input, setDropRef] = useDrop({
        // e代表dragOver事件发生时，正在被over的元素的event对象
        // collection是store存储的数据
        // showAfter是表示，是否鼠标拖拽元素时，鼠标经过drop元素的上方（上方就是上半边，下方就是下半边）
        onDragOver: (e, collection, showAfter) => {
            // 如果经过上半边，drop元素的上边框就是红色
            if (!showAfter) {
                input.current.style = "border-bottom: none;border-top: 1px solid red"
            } else {
                // 如果经过下半边，drop元素的上边框就是红色
                input.current.style = "border-top: none;border-bottom: 1px solid red"
            }
        },
        // 如果在drop元素上放开鼠标，则样式清空
        onDrop: () => {
            input.current.style = ""
        },
        // 如果在离开drop元素，则样式清空
        onDragLeave: () => {
            input.current.style = ""
        },
    });

    setDragRef(setDropRef(input));

    return (
        <div>
            <h1 ref={input}>{props.title}</h1>
        </div>
    )
}

const demo4: React.FC<any> = (props) => {


    return (
        <div>
            <DragAndDrop>
                <DragAndDropElement title='第一个元素' />
                <DragAndDropElement title='第二个元素' />
            </DragAndDrop>
        </div>
    );

}

export default demo4;