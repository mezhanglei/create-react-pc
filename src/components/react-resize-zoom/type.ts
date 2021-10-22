import { CSSProperties, JSXElementConstructor, ReactElement } from 'react';
// 事件对象
export type EventType = MouseEvent | TouchEvent;

export type ChildrenType = ReactElement<any, string | JSXElementConstructor<any>>

// 拖拽类型
export enum ResizeDragTypes {
    resizeStart = 'resizeStart',
    resizing = 'resizing',
    resizeEnd = 'resizeEnd'
}
export interface EventDataType {
    lastEventX?: number;
    lastEventY?: number;
    lastW?: number;
    lastH?: number;
    dir?: string;
    eventX: number;
    eventY: number;
    width: number;
    height: number;
    zIndex?: number;
    node: HTMLElement;
}
export enum Direction {
    N = "n", // 上边
    S = "s", // 下边
    W = "w", // 左边
    E = "e" // 右边
}
export enum ResizeAxis {
    AUTO = 'auto', // 所有轴
    X = 'x', // x轴
    Y = 'y', // y轴
    ANGLE = 'angle', // 角
    NONE = 'none'
}
export interface DragResizeProps {
    className?: string;
    style?: CSSProperties;
    axis: `${ResizeAxis}`;
    forbid?: boolean;
    children: any;
    offset: number; // 鼠标距离边的可以拖拽的偏差
    zIndexRange?: [number, number]; // zIndex变化的范围
    width?: number; // 受控尺寸
    height?: number; // 受控尺寸
    onResizeStart?: EventHandler; // 拖拽开始事件
    onResizeMoving?: EventHandler; // 拖拽进行中事件
    onResizeEnd?: EventHandler; // 拖拽结束事件
    forwardedRef?: any; // 拖拽目标的ref
}

export interface DragResizeState {
    eventData?: EventDataType
    prevWidth?: number;
    prevHeight?: number;
}
// 事件处理函数的type
export type EventHandler<E = EventType, T = EventDataType> = (e: E, data?: T) => void | boolean;