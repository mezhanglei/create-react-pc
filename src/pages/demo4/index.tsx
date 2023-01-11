import { DragAndDrop, useDrag, useDrop } from '@/components/react-drag-hook-demo';
import React, { Component, useState, useEffect, useRef, useCallback } from 'react';
import "./index.less";
import AddIcon from 'static/images/fail.png'
import { Uploader } from '@/components/react-upload/uploader';
import { Button } from 'antd';
import http from '@/http/request';
import { renderToStaticMarkup } from 'react-dom/server';
import demo2 from '../demo2';
import { from, mergeMap } from 'rxjs';
const array = [
  'https://httpbin.org/ip', 
  'https://httpbin.org/user-agent',
  'https://httpbin.org/delay/3',
];
const source = from(array).pipe(mergeMap((url)=> new Promise(resolve => setTimeout(() => resolve(`Result: ${url}`), 2000)), 2)).subscribe(val => console.log(val));
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
    const imgUploader = useRef<HTMLElement>();
    const uploadRef = useRef<Uploader>();

    const beforeUpload = useCallback(async (params) => {
        const ret = await http.post({ url: '/verify', data: { filename: params?.file?.name, hash: params?.fileHash } });
        return { uploaded: ret?.uploaded, uploadedList: ret?.uploadedList };
    }, [])

    const uploading = useCallback((params) => {
        const data = new FormData();
        data.append("chunk", params?.chunk?.chunk);
        data.append("hash", params?.chunk?.chunkName);
        data.append("filename", params?.file?.name);
        data.append("fileHash", params?.fileHash);
        return http.post({ url: '/upload', data: data });
    }, [])

    const afterUpload = useCallback((params) => {
        http.post({
            url: '/merge', data: {
                filename: params.file.name,
                size: params.size,
                fileHash: params.fileHash
            }
        });
    }, [])

    useEffect(() => {
        uploadRef.current = new Uploader({
            beforeUpload: beforeUpload,
            uploading: uploading,
            afterUpload: afterUpload
        })
        imgUploader.current = uploadRef.current?.dom;
    }, [beforeUpload, uploading, afterUpload]);

    function addImg() {
        imgUploader?.current?.click()
    }

    const handleUpload = () => {
        uploadRef.current?.handleUpload?.()
    }

    const handlePause = () => {

    }

    const handleContinue = () => {
        const str = renderToStaticMarkup(React.createElement(demo2));
    }

    return (
        <div>
            <DragAndDrop>
                <DragAndDropElement title='第一个元素' />
                <DragAndDropElement title='第二个元素' />
            </DragAndDrop>
            <div className="newpost">
                <img src={AddIcon} onClick={addImg} className="cover" />
                <Button onClick={handleUpload}>上传</Button>
                <Button onClick={handlePause}>暂停</Button>
                <Button onClick={handleContinue}>继续</Button>
            </div>
        </div>
    );

}

export default demo4;