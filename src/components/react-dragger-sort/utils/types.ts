import { CSSProperties, JSXElementConstructor, ReactElement } from 'react';
import { DraggerItemEvent, DraggerItemHandler } from "../dragger-item";

export type EventType = MouseEvent | TouchEvent;
export type ChildrenType = ReactElement<any, string | JSXElementConstructor<any>>
// 拖拽类型
export enum DragTypes {
  dragStart = 'dragStart',
  draging = 'draging',
  dragEnd = 'dragEnd'
};

// 元素类型
export interface DraggerItemType {
  node: HTMLElement;
  id: string | number; // 唯一id
}

// 拖拽元素
export interface MoveChild extends DraggerItemEvent {
  area?: HTMLElement; // moveChild所在的area
}

export enum CollisionDirection {
  Top = "top", // 上边
  Bottom = "bottom", // 下边
  Left = "left", // 左边
  Right = "right" // 右边
}

// 拖拽触发的参数
export interface DragParams {
  e: EventType,
  target: MoveChild; // 当前移动的元素
  area?: HTMLElement; // 容器dom
  collision?: DraggerItemType; // 当前碰撞的元素
}

// 拖拽回调函数
export type DragMoveHandle = (params: DragParams) => void | boolean;
// 被监听的事件类型
export type listenEvent = { listener: (moveChild: MoveChild, e: EventType) => void | boolean, area: HTMLElement | null };
// 容器触发事件的类型
export type TriggerFuncHandle<T = MoveChild, E = EventType> = (moveChild: T, e: E) => boolean;
// 容器监听事件的类型
export type ListenFuncHandle = (area: HTMLElement, addEvent: listenEvent['listener']) => void;
// 拖拽类
export type DraggableAreaBuilder = (props?: { triggerFunc: TriggerFuncHandle; subscribe: ListenFuncHandle, unsubscribe: (area?: HTMLElement | null) => void, draggerItems: DraggerItemType[] }) => any;

// context
export interface DraggerContextInterface {
  onDragStart?: DraggerItemHandler;
  onDrag?: DraggerItemHandler;
  onDragEnd?: DraggerItemHandler;
  collision?: DraggerItemType; // 当前被覆盖的元素
  draggerItems?: DraggerItemType[]
}

export interface DraggableAreaProps {
  className?: string;
  style?: CSSProperties;
  children: any;
  dataSource: any; // 列表渲染的数据源
  onDragMoveStart?: DragMoveHandle; // 拖拽开始
  onDragMove?: DragMoveHandle; // 容器内拖拽时触发的函数
  onDragMoveEnd?: DragMoveHandle; // 容器内拖拽结束时触发的函数
  onMoveOutChange?: DragMoveHandle; // 跨容器拖出触发的函数
  onMoveInChange?: DragMoveHandle; // 跨容器拖拽进触发的函数
}

export interface DraggableAreaState {
  collision?: DraggerItemType
}