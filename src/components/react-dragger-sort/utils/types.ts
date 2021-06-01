import React, { CSSProperties, JSXElementConstructor, ReactElement } from 'react';
import { DraggerItemEvent, DraggerItemHandler } from "../dragger-item";

export type EventType = MouseEvent | TouchEvent;
export type ChildrenType = ReactElement<any, string | JSXElementConstructor<any>>

/** DraggableArea组件 */
// 拖拽容器对象的类型
export interface ContainerInterface {
    node: HTMLElement;
    areaId?: string | number;
}

// 拖拽子元素集合
export interface DraggerChildNodes {
    node: HTMLElement,
    id: string | number
}

// 拖拽tag对象的类型
export interface TagInterface {
    x?: number; // 在容器内的x轴位置
    y?: number; // 在容器内的y轴位置
    width?: number; // 宽度
    height?: number; // 高度
    areaId?: string | number; // tag所在的area的id
    translateX?: number;
    translateY?: number;
    id: string | number; // tag的id
    node: HTMLElement; // tag节点
    [key: string]: any;
}

// 跨容器拖拽结果类型
export type DragRet = { isTrigger?: boolean; fromAreaId?: string | number; areaId?: string | number };
// 拖拽回调函数
export type DragMoveHandle = (tag: TagInterface, coverChild?: DraggerChildNodes, e?: EventType) => void | boolean;
// 添加tag函数类型
export type AddTagFunc = (tag: TagInterface, ret: DragRet, e: EventType) => void | boolean;
// 添加队列的类型
export type AddAreaFunc = (tag: TagInterface, e: EventType) => DragRet;
// 容器触发添加事件的类型
export type TriggerAddFuncHandle<T = TagInterface, E = EventType> = (tag: T, e: E) =>  DragRet;
// 容器监听添加事件的类型
export type ListenAddFuncHandle = (area: ContainerInterface, addTag: AddTagFunc) => void;
// 拖拽类
export type DraggableAreaBuilder = (props?: { triggerAddFunc: TriggerAddFuncHandle; listenAddFunc: ListenAddFuncHandle; areaId: string | number }) => any;


// 拖拽容器props
export interface TriggerInfo {
    type: 'in' | 'out' | string; // in拖进，out拖出
    areaId?: string | number; // 拖进的area的id
    fromAreaId?: string | number; // 拖出的area的id
    coverChild?: DraggerChildNodes; // 跨容器的coverChild
    moveTag: TagInterface; // 当前移动的元素
}
export interface DraggableAreaProps {
    className?: string;
    style?: CSSProperties;
    children: any;
    onDragMove?: DragMoveHandle; // 容器内拖拽结束中触发的函数
    onDragMoveEnd?: DragMoveHandle; // 容器内拖拽结束时触发的函数
    onChange?: (triggerInfo: TriggerInfo) => void | boolean; // 跨容器会触发的函数
}

// context
export interface DraggerContextInterface {
    onDragStart?: DraggerItemHandler;
    onDrag?: DraggerItemHandler;
    onDragEnd?: DraggerItemHandler;
    onResizeStart?: DraggerItemHandler;
    onResizing?: DraggerItemHandler;
    onResizeEnd?: DraggerItemHandler;
    listenChild?: (value: DraggerChildNodes) => void;
    childLayOut?: { [key: string]: DraggerItemEvent } | {}; // 控制拖拽子元素的布局(注意:当拖拽时是不更新的)
    coverChild?: DraggerChildNodes; // 当前被覆盖的元素
    zIndexRange?: [number, number];
    isReflow?: boolean; // 拖拽过程中子元素是否重新排列
}