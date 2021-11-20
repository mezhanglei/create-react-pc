import { CSSProperties } from "react";

export type EventType = MouseEvent | TouchEvent;

export interface DrawItemProps {
    children: any
    className?: string
    style?: CSSProperties
    forwardedRef?: any
    forbid?: boolean
    offset: number
    axis: Direction[]
    width?: number
    height?: number
    left?: number
    top?: number
    transform?: string
}

export interface LastStyle {
    width: number
    height: number
    top: number
    left: number
    eventX: number
    eventY: number
}

export interface NowStyle {
    width?: number
    height?: number
    left?: number
    top?: number
    transform?: string
}

export interface DrawItemState {
    nowStyle?: NowStyle
    prevWidth?: number
    prevHeight?: number
    prevLeft?: number
    prevTop?: number
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
    X = "x", // 左右拖拽
    Y = "y", // 上下拖拽
    Rotate="rotate" // 旋转
}
export const DirectionCode = Object.values(Direction);

// 事件处理函数的type
export type EventHandler<E = EventType> = (e: E) => void | boolean;