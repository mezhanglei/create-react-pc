import React, { CSSProperties, JSXElementConstructor, ReactElement } from 'react';

export type EventType = MouseEvent | TouchEvent;
export type ChildrenType = ReactElement<any, string | JSXElementConstructor<any>>

// 拖拽tag对象的类型
export interface TagInterface {
    gridX: number;
    gridY: number;
    gridW: number;
    gridH: number;
    fromAreaId: string | number; // tag所在的area的id
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

// 包装拖拽容器
export type DraggableAreaBuilder = (props?: { triggerAddFunc: TriggerAddFuncHandle; listenAddFunc: ListenAddFuncHandle; areaId: string | number }) => any;

// 拖拽容器的类型
export interface DraggableAreaProps {
    className?: string;
    width?: number;
    style?: CSSProperties;
    children: ChildrenType;
}