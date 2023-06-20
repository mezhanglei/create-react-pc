import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
import { Prompt } from "react-router-dom";
import history from "@/routes/history";

export interface CustomPromptProps {
    onOk?: (...rest: any[]) => any;
    onCancel?: (...rest: any[]) => any;
    isPrompt: boolean;
}

/**
 * 自定义拦截路由组件
 * 使用：直接在该组件内实例化
 */
const CustomPrompt: React.FC<CustomPromptProps> = (props) => {

    const {
        onOk,
        onCancel
    } = props;
    // 是否启用Prompt
    const [isPrompt, setIsPrompt] = useState<boolean>(false);


    useEffect(() => {
        setIsPrompt(props.isPrompt);
    }, [props.isPrompt]);

    // 下一步: 不管是否阻塞路由都会切换，所以需要通过history去刷新或回退
    const nextStep = (isOk: boolean, pathname?: string) => {
        if (pathname) {
            setTimeout(() => {
                if (isOk) {
                    setIsPrompt(false);
                    history.go(0);
                } else {
                    setIsPrompt(true);
                    history.go(-1);
                }
            });
        }
    };
    return (
        <Prompt
            when={isPrompt}
            message={(location) => {
                if (!isPrompt) {
                    return true;
                }

                Modal.confirm({
                    content: '暂未保存您所做的更改，是否保存？',
                    okText: '保存',
                    cancelText: '不保存',
                    onOk() {
                        onOk && onOk();
                        nextStep(true, location.pathname);
                    },
                    onCancel() {
                        onCancel && onCancel();
                        nextStep(false, location.pathname);
                    }
                });
                return false;
            }}
        />
    );
};


export default CustomPrompt;
