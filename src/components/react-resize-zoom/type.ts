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

export interface LastStyle {
    width: number
    height: number
    eventX: number
    eventY: number
}

export interface NowStyle {
    width: number
    height: number
}
export enum Direction {
    N = "n", // 上边
    S = "s", // 下边
    W = "w", // 左边
    E = "e", // 右边
    NE = "ne", // 右上
    NW = "nw", // 左上
    SE = "se", // 右下
    SW = "sw", // 左下
}
export const DirectionCode = Object.values(Direction);

export interface DragResizeProps {
    className?: string;
    style?: CSSProperties;
    axis: Direction[];
    forbid?: boolean;
    children: any;
    offset: number; // 鼠标距离边的可以拖拽的偏差
    width?: number; // 受控尺寸
    height?: number; // 受控尺寸
    onResizeStart?: EventHandler; // 拖拽开始事件
    onResizeMoving?: EventHandler; // 拖拽进行中事件
    onResizeEnd?: EventHandler; // 拖拽结束事件
    forwardedRef?: any; // 拖拽目标的ref
}

export interface DragResizeState {
    nowStyle?: NowStyle
    prevWidth?: number;
    prevHeight?: number;
}

export interface EventData {
    node: HTMLElement
    dir: string
    width: number
    height: number
}

// 事件处理函数的type
export type EventHandler<E = EventType, T = EventData> = (e: E, data?: T) => void | boolean;