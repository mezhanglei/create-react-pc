import { DndSourceItem, DndItemHandler } from "../dnd-core";

export type EventType = MouseEvent | TouchEvent;
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

// 拖拽容器
export interface MoveInArea {
  area: HTMLElement
  path: string
}

export interface TargetParams extends MoveInArea {
  item: DndTargetItemType
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
  target: MoveInArea
}

// 被监听的事件类型
export type listenEvent = { listener: (params: ListenParams) => MoveInArea | void, target: MoveInArea };
// 容器触发事件的类型
export type NotifyEventHandle = (sourceParams: SourceParams) => MoveInArea | void;
// 容器监听事件的类型
export type SubscribeHandle = (target: MoveInArea, addEvent: listenEvent['listener']) => void;

// 拖拽回调参数
export interface DndParams extends SourceParams {
  target: {
    area: HTMLElement
    item?: DndTargetItemType
    path: string
  }
}
// 拖拽回调函数
export type DragMoveHandle = (params: DndParams) => void | boolean;

// DndChildrenContext的props
export interface DndChildrenContextProps {
  contextDragStart?: DndItemHandler;
  contextDrag?: DndItemHandler;
  contextDragEnd?: DndItemHandler;
  contextHoverItem?: DndTargetItemType;
}