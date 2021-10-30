import { DragAndDrop, useDrag, useDrop } from '@/components/react-drag-hook-demo';
import React, { Component, useState, useEffect, useRef, useCallback } from 'react';
import "./index.less";
import useUpload from '@/components/react-upload/hook';
import AddIcon from 'static/images/fail.png'

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


    const [postParams, setPostParams] = useState({});

    const getUploadList = useCallback((file: File[]) => {
        setPostParams(postParams => {
            if (file.length + postParams.file.length > 9) {
                Toast.fail('最多上传9张图片')
                return postParams
            }
            return {
                ...postParams,
                file: postParams.file.concat(file),
            }
        })
    }, []);

    const imgUploader = useUpload({ callback: getUploadList, count: 9 });

    const mediaUploader = useUpload({
        callback: file => {
            console.log(file)
        },
        type: 'video',
    })

    function addImg() {
        imgUploader?.current?.click()
    }

    function addMedia() {
        mediaUploader?.current?.click()
    }

    return (
        <div>
            <DragAndDrop>
                <DragAndDropElement title='第一个元素' />
                <DragAndDropElement title='第二个元素' />
            </DragAndDrop>
            <div className="newpost">
                <div onClick={addMedia}>upload</div>
                <img src={AddIcon} onClick={addImg} className="cover" />
            </div>
        </div>
    );

}

export default demo4;