import React, { CSSProperties, JSXElementConstructor, ReactElement } from 'react';
import { DraggerItemEvent, DraggerItemHandler } from "../dragger-item";

export type EventType = MouseEvent | TouchEvent;
export type ChildrenType = ReactElement<any, string | JSXElementConstructor<any>>
// 拖拽类型
export enum DragTypes {
    dragStart ='dragStart',
    draging = 'draging',
    dragEnd = 'dragEnd',
    resizeStart = 'resizeStart',
    resizing = 'resizing',
    resizeEnd = 'resizeEnd'
}
// 拖拽tag对象的类型
export interface TagInterface {
    x?: number; // 在容器内的x轴位置
    y?: number; // 在容器内的y轴位置
    width?: number; // 宽度
    height?: number; // 高度
    area?: HTMLElement; // tag所在的area
    dragType?: `${DragTypes}`, // 当前拖拽类型
    translateX?: number;
    translateY?: number;
    node: HTMLElement; // tag节点
}

// 跨域拖拽的tag的类型
export interface AreaTagInterface extends TagInterface {
    area?: HTMLElement; // tag所在的area
    dragPreIndex?: number; // 拖拽前的所在队列的index序号
}

export interface InitPosition {
    x: number; // 在容器内的x轴位置
    y: number; // 在容器内的y轴位置
    width: number; // 宽度
    height: number; // 高度
}

// 拖拽回调函数
export type DragMoveHandle = (tag: TagInterface, coverChild?: HTMLElement,dragPreIndex?: number, dragNextIndex?: number, e?: EventType) => void | boolean;
// 添加tag函数类型
export type AddTagFunc = (tag: AreaTagInterface, e: EventType) => void | boolean;
// 容器触发添加事件的类型
export type TriggerAddFuncHandle<T = AreaTagInterface, E = EventType> = (tag: T, e: E) =>  boolean;
// 容器监听添加事件的类型
export type ListenAddFuncHandle = (area: HTMLElement, addTag: AddTagFunc) => void;
// 拖拽类
export type DraggableAreaBuilder = (props?: { triggerAddFunc: TriggerAddFuncHandle; listenAddFunc: ListenAddFuncHandle }) => any;


// 拖拽容器props
export interface TriggerInfo {
    area?: HTMLElement; // 当前触发的area
    coverChild?: HTMLElement; // 当前的被over的coverChild
    moveTag: TagInterface; // 当前移动的元素
}
export interface DraggableAreaProps {
    className?: string;
    style?: CSSProperties;
    children: any;
    onDragMove?: DragMoveHandle; // 容器内拖拽时触发的函数
    onDragMoveEnd?: DragMoveHandle; // 容器内拖拽结束时触发的函数
    onMoveOutChange?: (triggerInfo: TriggerInfo) => void | boolean; // 跨容器拖出触发的函数
    onMoveInChange?: (triggerInfo: TriggerInfo) => void | boolean; // 跨容器拖拽进触发的函数
}

// context
export interface DraggerContextInterface {
    onDragStart?: DraggerItemHandler;
    onDrag?: DraggerItemHandler;
    onDragEnd?: DraggerItemHandler;
    onResizeStart?: DraggerItemHandler;
    onResizing?: DraggerItemHandler;
    onResizeEnd?: DraggerItemHandler;
    listenChild?: (value: HTMLElement) => void;
    childLayout?: DraggerItemEvent[]; // 控制拖拽子元素的布局(注意:当拖拽时是不更新的)
    coverChild?: HTMLElement; // 当前被覆盖的元素
    zIndexRange?: [number, number];
    parentDragType?: `${DragTypes}`; // 父元素内发生的拖拽类型
}