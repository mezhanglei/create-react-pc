import { DndSourceItem } from "../dnd-core";

export type EventType = MouseEvent | TouchEvent;
// 拖拽类型
export enum DragTypes {
  dragStart = 'dragStart',
  draging = 'draging',
  dragEnd = 'dragEnd'
};

export interface DndCallBackProps {
  onAdd?: DndHandle; // 跨容器拖拽进行中
  onAddEnd?: DndHandle; // 跨容器拖拽结束
  onHover?: DndHandle; // 同容器拖拽进行中
  onHoverEnd?: DndHandle; // 同容器拖拽结束
  onChoose?: DndHandle; // 目标被拖拽触发的函数
  onUnchoose?: DndHandle; // 目标被拖拽目标移出触发的函数
}

// 元素类型
export interface TargetParams extends DndCallBackProps {
  node: HTMLElement;
  path: string;
}

// 拖拽源信息
export interface SourceParams {
  e: EventType
  source: DndSourceItem
}

// 是否激活
export enum ActiveTypes {
  active = '0',
  notActive = '1'
}
// 拖拽触发的函数的参数
export interface DndParams extends SourceParams {
  target?: TargetParams
}
// 被监听的事件类型
export type listenEvent = { listener: (params: DndParams) => TargetParams | void, sortableItem: TargetParams };
// 容器触发事件的类型
export type NotifyEventHandle = (dndParams: DndParams) => TargetParams | void;
// 容器监听事件的类型
export type SubscribeHandle = (sortableItem: TargetParams) => void;
// 拖拽触发的函数
export type DndHandle = (params: DndParams) => void;