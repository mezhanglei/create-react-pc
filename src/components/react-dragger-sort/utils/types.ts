import React, { CSSProperties, JSXElementConstructor, ReactElement } from 'react';
import { DraggerItemEvent, DraggerItemHandler } from "../dragger-item";

export type EventType = MouseEvent | TouchEvent;
export type ChildrenType = ReactElement<any, string | JSXElementConstructor<any>>
// 拖拽类型
export enum DragTypes {
    dragStart = 'dragStart',
    draging = 'draging',
    dragEnd = 'dragEnd'
}

// 可拖拽子元素的类型
export interface ChildTypes {
    node: HTMLElement;
    id: string | number; // 唯一id
}

// 拖拽元素
export interface TagInterface extends DraggerItemEvent {
    area?: HTMLElement; // tag所在的area
}

// 拖拽回调函数
export type DragMoveHandle = (tag: TagInterface, coverChild?: ChildTypes, e?: EventType) => void | boolean;
// 被监听的事件类型
export type listenEvent = { listener: (tag: TagInterface, e: EventType) => void | boolean, area: HTMLElement | null };
// 容器触发事件的类型
export type TriggerFuncHandle<T = TagInterface, E = EventType> = (tag: T, e: E) => boolean;
// 容器监听事件的类型
export type ListenFuncHandle = (area: HTMLElement, addEvent: listenEvent['listener']) => void;
// 拖拽类
export type DraggableAreaBuilder = (props?: { triggerFunc: TriggerFuncHandle; subscribe: ListenFuncHandle, unsubscribe: (area?: HTMLElement | null) => void, draggerItems: ChildTypes[] }) => any;

// context
export interface DraggerContextInterface {
    onDragStart?: DraggerItemHandler;
    onDrag?: DraggerItemHandler;
    onDragEnd?: DraggerItemHandler;
    coverChild?: ChildTypes; // 当前被覆盖的元素
    draggerItems?: ChildTypes[]
    zIndexRange?: [number, number];
}

// 拖拽容器props
export interface TriggerInfo {
    area?: HTMLElement; // 当前触发的area
    coverChild?: ChildTypes; // 当前的被over的coverChild
    moveTag: TagInterface; // 当前移动的元素
}
export interface DraggableAreaProps {
    className?: string;
    style?: CSSProperties;
    children: any;
    dataSource: any; // 列表渲染的数据源
    onDragMove?: DragMoveHandle; // 容器内拖拽时触发的函数
    onDragMoveEnd?: DragMoveHandle; // 容器内拖拽结束时触发的函数
    onMoveOutChange?: (triggerInfo: TriggerInfo) => void | boolean; // 跨容器拖出触发的函数
    onMoveInChange?: (triggerInfo: TriggerInfo) => void | boolean; // 跨容器拖拽进触发的函数
}

export interface DraggableAreaState {
    coverChild?: ChildTypes
}