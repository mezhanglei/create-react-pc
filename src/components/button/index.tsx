

import React, { Component } from 'react';
import { useEffect, useState } from "react";
import { isString } from "@/utils/type";
import "./index.less";
import classNames from "classnames";

// 类型
export enum BUTTON_TYPE {
    PRIMARY = "primary", // 实心
    DEFAULT = "default", // 空心
    DASHED = "dashed" // 虚线
}

// 功能
export enum HTML_TYPE {
    BUTTON = "button", // 按钮功能
    SUBMIT = "submit", // 提交表单功能
    RESET = "reset" // 清空表单功能
}

// 形状
export enum SHAPE_TYPE {
    CIRCLE = "circle" // 圆形
}

// 大小
export enum SIZE_TYPE {
    LARGE = "large", // 大按钮
    SMALL = "small" // 小按钮
}

export interface ButtonProps {
    prefixCls?: string;
    type?: "primary" | "default" | "dashed"; // 按钮类型
    htmlType?: "button" | "submit" | "reset"; // 功能
    shape?: "circle"; // 形状
    size?: 'large' | "small"; // 大小
    danger?: boolean; // 是否为警告颜色
    disabled?: boolean; // 禁用
    onClick?: (e: any) => any;
    className?: string;
    children: React.ReactNode;
}

const reg = /^[\u4e00-\u9fa5]{2}$/;
const isTwoCNChar = reg.test.bind(reg);
const Button = React.forwardRef<any, ButtonProps>((props, ref) => {

    const {
        prefixCls = "mine-button",
        type = BUTTON_TYPE.PRIMARY,
        htmlType = HTML_TYPE.BUTTON,
        shape,
        danger,
        size,
        disabled,
        onClick,
        className,
        ...rest
    } = props;

    const classes = classNames(prefixCls, className, {
        [`${prefixCls}-${type}`]: type,
        [`${prefixCls}-${shape}`]: shape,
        [`${prefixCls}-dangerous`]: !!danger,
        [`${prefixCls}-${size}`]: size
    });

    const wrapChild = (child: any) => {
        // 汉字分隔
        if (isString(child)) {
            if (isTwoCNChar(child)) {
                child = child.split('').join(' ');
            }
            return <span>{child}</span>;
        }
        return child;
    };

    const handleClick = (e: any) => {
        onClick && onClick(e);
    };

    const kids = React.Children.map(props.children, wrapChild);

    return (
        <button
            {...rest}
            disabled={disabled}
            type={htmlType}
            className={classes}
            onClick={handleClick}
            ref={ref}
        >
            {kids}
        </button>
    );
});

export default Button;
