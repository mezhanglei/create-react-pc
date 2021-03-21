import { JSXElementConstructor, ReactElement } from 'react';
// 事件对象
export type EventType = MouseEvent | TouchEvent;

// 事件处理函数的type
export type EventHandler<T> = (e: T) => void | boolean;
export type ChildrenType = ReactElement<any, string | JSXElementConstructor<any>>
export interface LastEventDataType {
    lastDir?: string;
    lastX?: number;
    lastY?: number;
    lastW?: number;
    lastH?: number;
}
export interface EventDataType extends LastEventDataType {
    x: number;
    y: number;
    width: number;
    height: number;
}
export enum Direction {
    N = "n", // 上边
    S = "s", // 下边
    W = "w", // 左边
    E = "e" // 右边
}
export enum Axis {
    AUTO = 'auto', // 所有轴
    X = 'x', // x轴
    Y = 'y', // y轴
    ANGLE = 'angle' // 角
}
export interface DragResizeProps {
    axis?: 'auto' | 'x' | 'y' | 'angle';
    children: ChildrenType;
    offset?: number; // 鼠标距离边的可以拖拽的偏差
    onResizeStart?: (e: EventType, data?: EventDataType) => void | boolean; // 拖拽开始事件
    onResizeMoving?: (e: EventType, data?: EventDataType) => void | boolean; // 拖拽进行中事件
    onResizeEnd?: (e: EventType, data?: EventDataType) => void | boolean; // 拖拽结束事件
}