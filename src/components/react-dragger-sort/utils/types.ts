import { CSSProperties, JSXElementConstructor, ReactElement } from 'react';
import { DndSourceItem, DndItemHandler } from "../dnd-item";

export type EventType = MouseEvent | TouchEvent;
export type ChildrenType = ReactElement<any, string | JSXElementConstructor<any>>
// 拖拽类型
export enum DragTypes {
  dragStart = 'dragStart',
  draging = 'draging',
  dragEnd = 'dragEnd'
};

// 元素类型
export interface DndTargetItemType {
  node: HTMLElement;
  id: string | number; // 唯一id
}

// 容器订阅信息
export interface SubscribeTargetParams {
  area: HTMLElement
  collect: unknown
}

// 拖拽源信息
export interface SourceParams {
  e: EventType
  source: {
    area: HTMLElement
    item: DndSourceItem
    collect: unknown
  }
}

// 监听回调的参数
export interface ListenParams extends SourceParams {
  target: SubscribeTargetParams
}

// 被监听的事件类型
export type listenEvent = { listener: (params: ListenParams) => SubscribeTargetParams | void, target: SubscribeTargetParams };
// 容器触发事件的类型
export type TriggerFuncHandle = (sourceParams: SourceParams) => SubscribeTargetParams | void;
// 容器监听事件的类型
export type SubscribeHandle = (target: SubscribeTargetParams, addEvent: listenEvent['listener']) => void;
// 拖拽容器构造函数
export type DndAreaBuilder = () => any;

// 拖拽容器props
export interface DndAreaProps {
  className?: string;
  style?: CSSProperties;
  children: any;
  collect: unknown
}
// 拖拽容器state
export interface DndAreaState {
  targetItem?: DndTargetItemType
  prevCollect?: unknown
}

// 拖拽回调参数
export interface DndParams {
  e: EventType
  target: {
    area: HTMLElement
    item?: DndTargetItemType
    collect: unknown
  }
  source: {
    area: HTMLElement
    item: DndSourceItem
    collect: unknown
  }
}
// 拖拽回调函数
export type DragMoveHandle = (params: DndParams) => void | boolean;
export interface DndContextProps {
  onDragStart?: DragMoveHandle; // 拖拽开始
  onDrag?: DragMoveHandle; // 容器内拖拽时触发的函数
  onDragEnd?: DragMoveHandle; // 容器内拖拽结束时触发的函数
}

// DndContextProvider的props
export interface DndContextProviderProps extends DndContextProps {
  children: any
}

// DndAreaContext的props
export interface DndAreaContextProps {
  onDragStart?: DndItemHandler;
  onDrag?: DndItemHandler;
  onDragEnd?: DndItemHandler;
  targetItem?: DndTargetItemType; // 当前被覆盖的元素
  dndItems?: DndTargetItemType[]
}