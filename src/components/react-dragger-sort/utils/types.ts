import { DragDirection } from "@/components/react-free-draggable";
import { CSSProperties } from "react";

export type EventType = MouseEvent | TouchEvent;
// 拖拽状态
export enum DndStatus {
  start = 'start',
  move = 'move',
  end = 'end'
};

export interface DndCallBackProps {
  onAdd?: DndHandle; // 跨容器拖拽后触发的函数
  onUpdate?: DndHandle; // 同容器拖拽后触发的函数
  onChoose?: DndHandle; // 目标被拖拽触发的函数
  onUnchoose?: DndHandle; // 目标被拖拽目标移出触发的函数
}

// 拖拽源信息
export interface FromParams {
  e: EventType
  from: {
    group: HTMLElement // 所在列表
    item: HTMLElement // 目标元素
    clone: HTMLElement // 目标克隆出来的元素
    index: number // 拖拽前在列表中的序号
    draggableIndex: number // 拖拽前在列表中的序号(排除不可拖拽的元素)
    status: DndStatus // 拖拽的过程状态
  }
}

// 放置时的信息
export interface ToParams extends DndCallBackProps {
  group: HTMLElement // 所在列表
  index: number // 拖拽后在列表中的序号
  draggableIndex: number // 拖拽后在列表中的序号(排除不可拖拽的元素)
}

// 是否激活
export enum ActiveTypes {
  active = '0',
  notActive = '1'
}
// 拖拽触发的函数的参数
export interface DndParams extends FromParams {
  to?: ToParams
}
export interface DndProps extends DndCallBackProps {
  children: any;
  className?: string;
  style?: CSSProperties;
  onStart?: DndHandle;
  onMove?: DndHandle;
  onEnd?: DndHandle;
  direction?: DragDirection[];
  sort?: boolean // 是否允许排序
  removeCloneOnHide?: boolean // 当元素没有显示时移除
  options: {
    group: string | HTMLElement;
    allowDrag: boolean | (HTMLElement | string)[] // 允许拖拽或允许拖拽的子元素
    allowDrop: boolean | (HTMLElement | string)[] // 允许拖放或允许拖放的子元素
    mode?: 'clone'; // 拖拽不影响元素布局显示
  }
}

// 被监听的事件类型
export type listenEvent = { listener: (params: DndParams) => ToParams | void, sortableItem: ToParams };
// 容器触发事件的类型
export type NotifyEventHandle = (dndParams: DndParams) => ToParams | void;
// 容器监听事件的类型
export type SubscribeHandle = (sortableItem: ToParams) => void;
// 拖拽触发的函数
export type DndHandle = (params: DndParams) => void;