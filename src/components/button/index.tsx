

import React from 'react';
import { isString } from "@/utils/type";
import "./index.less";
import classNames from "classnames";

// 类型
export type BUTTON_TYPE = "primary" | "default" | "dashed" | "ghost"

// 功能
export type HTML_TYPE = "button" | "submit" | "reset";

// 形状
export type SHAPE_TYPE = "circle"

// 大小
export type SIZE_TYPE = "large" | "small";

export interface ButtonProps {
  prefixCls?: string;
  type?: BUTTON_TYPE; // 按钮类型
  htmlType?: HTML_TYPE; // 功能
  shape?: SHAPE_TYPE; // 形状
  ghost?: boolean; // 是否按钮背景透明
  size?: SIZE_TYPE; // 大小
  danger?: boolean; // 是否为警告颜色
  disabled?: boolean; // 禁用
  onClick?: (e: any) => any;
  className?: string;
  children?: React.ReactNode;
}

const reg = /^[\u4e00-\u9fa5]{2}$/;
const isTwoCNChar = reg.test.bind(reg);
const Button = React.forwardRef<any, ButtonProps>((props, ref) => {

  const {
    prefixCls = "mine-button",
    type = 'primary',
    htmlType = "button",
    shape,
    danger,
    size,
    disabled,
    ghost,
    onClick,
    className,
    ...rest
  } = props;

  const classes = classNames(prefixCls, className, {
    [`${prefixCls}-${type}`]: type,
    [`${prefixCls}-ghost`]: !!ghost,
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
