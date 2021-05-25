import React, { CSSProperties, JSXElementConstructor, ReactElement } from 'react';
import { BoundsInterface } from '@/components/react-free-draggable';
import { DraggerItemEvent, DraggerItemHandler } from "./dragger-item";

export type EventType = MouseEvent | TouchEvent;
export type ChildrenType = ReactElement<any, string | JSXElementConstructor<any>>

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

// 拖拽容器对象的类型
export interface ContainerInterface {
    node: HTMLElement;
    areaId?: string | number;
}

// 添加tag函数类型
export type AddTagFunc = (tag: TagInterface, e: EventType) => void | boolean;
// 添加队列的类型
export type AddAreaFunc = (tag: TagInterface, e: EventType) => { isIn: boolean; fromAreaId: string | number; areaId: string | number };
// 容器触发添加事件的类型
export type TriggerAddFuncHandle<T = TagInterface, E = EventType> = (tag: T, e: E) => void;
// 容器监听添加事件的类型
export type ListenAddFuncHandle = (area: ContainerInterface, addTag: AddTagFunc) => void;
// 拖拽回调函数
export type DragMoveHandle = (tag: DraggerItemEvent, coverChild: DraggerChildNodes | undefined, e?: EventType) => void | boolean;

// 拖拽类
export type DraggableAreaBuilder = (props?: { triggerAddFunc: TriggerAddFuncHandle; listenAddFunc: ListenAddFuncHandle; areaId: string | number }) => any;

// 拖拽容器props
export interface DraggableAreaProps {
    className?: string;
    style?: CSSProperties;
    children: any;
    placeholder?: boolean;
    bounds?: string | HTMLElement | BoundsInterface;
    onDragMove?: DragMoveHandle;
    onDragMoveEnd?: DragMoveHandle;
}

// palceholder的props
export interface PlaceholderProps {
    x: number;
    y: number;
    lastX?: number;
    lastY?: number;
    lastW?: number;
    lastH?: number;
    width: number;
    height: number;
}

// context
export interface DraggerContextInterface {
    onDragStart?: DraggerItemHandler;
    onDrag?: DraggerItemHandler;
    onDragEnd?: DraggerItemHandler;
    onResizeStart?: DraggerItemHandler;
    onResizing?: DraggerItemHandler;
    onResizeEnd?: DraggerItemHandler;
    parentRef?: any;
    listenChild?: (value: DraggerChildNodes) => void;
    childLayOut?: { [key: string]: DraggerItemEvent } | {}, // 控制拖拽子元素的布局(注意:当拖拽时是不更新的)
    childNodes?: DraggerChildNodes[], // 拖拽子元素的集合
    zIndexRange?: [number, number];
    bounds?: string | HTMLElement | BoundsInterface;
    isReflow?: boolean; // 是否发生重绘
}