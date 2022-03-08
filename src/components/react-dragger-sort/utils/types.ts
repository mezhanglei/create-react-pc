import { CSSProperties, JSXElementConstructor, ReactElement } from 'react';
import { DndSourceItem, DndItemHandler } from "../dnd-item";
import { DndStore } from '../dnd-store';

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
  path: string
}

// 容器订阅信息
export interface SubscribeTargetParams {
  area: HTMLElement
  path: string
}

export interface TargetParams extends SubscribeTargetParams {
  item?: DndTargetItemType
}

// 拖拽源信息
export interface SourceParams {
  e: EventType
  source: {
    area: HTMLElement
    item: DndSourceItem
    path: string
  }
}

// 监听回调的参数
export interface ListenParams extends SourceParams {
  target: SubscribeTargetParams
}

// 被监听的事件类型
export type listenEvent = { listener: (params: ListenParams) => SubscribeTargetParams | void, target: SubscribeTargetParams };
// 容器触发事件的类型
export type NotifyEventHandle = (sourceParams: SourceParams) => SubscribeTargetParams | void;
// 容器监听事件的类型
export type SubscribeHandle = (target: SubscribeTargetParams, addEvent: listenEvent['listener']) => void;
// 拖拽容器构造函数
export type DndAreaBuilder = () => any;

// 拖拽容器props
export interface DndAreaProps {
  className?: string;
  style?: CSSProperties;
  children: any;
  id: any
  path?: string
}

// 拖拽回调参数
export interface DndParams extends SourceParams {
  target: TargetParams
}
// 拖拽回调函数
export type DragMoveHandle = (params: DndParams) => void | boolean;

// DndProvider的props
export interface DndProviderProps {
  children?: any
  onDragStart?: DragMoveHandle; // 拖拽开始
  onDrag?: DragMoveHandle; // 容器内拖拽时触发的函数
  onDragEnd?: DragMoveHandle; // 容器内拖拽结束时触发的函数
  onAreaDropping?: DragMoveHandle; // 跨域拖拽时触发的函数
  onAreaDropEnd?: DragMoveHandle; // 跨域拖拽结束触发的函数
}

// DndProviderContext
export interface DndProviderContextProps extends DndProviderProps {
  store: DndStore;
}

// DndAreaContext的props
export interface DndAreaContextProps {
  onDragStart?: DndItemHandler;
  onDrag?: DndItemHandler;
  onDragEnd?: DndItemHandler;
  targetItem?: DndTargetItemType;
  path: string
}