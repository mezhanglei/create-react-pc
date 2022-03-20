import { DndSourceItem, DndItemHandler } from "../dnd-core";

export type EventType = MouseEvent | TouchEvent;
// 拖拽类型
export enum DragTypes {
  dragStart = 'dragStart',
  draging = 'draging',
  dragEnd = 'dragEnd'
};

// 元素类型
export interface TargetParams {
  node: HTMLElement;
  path: string
}

// 拖拽源信息
export interface SourceParams {
  e: EventType
  source: DndSourceItem
}

// 监听回调的参数
export interface ListenParams extends SourceParams {
  target: TargetParams
}

// 被监听的事件类型
export type listenEvent = { listener: (params: ListenParams) => TargetParams | void, target: TargetParams };
// 容器触发事件的类型
export type NotifyEventHandle = (dndParams: DndParams) => TargetParams | void;
// 容器监听事件的类型
export type SubscribeHandle = (target: TargetParams, addEvent: (params: ListenParams) => void, removeEvent: (params: ListenParams) => void) => void;

// 拖拽回调参数
export interface DndParams extends SourceParams {
  target?: TargetParams
}
// 拖拽回调函数
export type DragMoveHandle = (params: DndParams) => void | boolean;

// DndChildrenContext的props
export interface DndChildrenContextProps {
  contextDragStart?: DndItemHandler;
  contextDrag?: DndItemHandler;
  contextDragEnd?: DndItemHandler;
  contextHoverItem?: TargetParams;
}