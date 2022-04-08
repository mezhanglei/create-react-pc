import { CSSProperties } from "react";

export type EventType = MouseEvent | TouchEvent;
// 拖拽状态
export enum DndStatus {
  Start = 'start',
  Move = 'move',
  End = 'end'
};

// 可排序项
export interface SortableItem {
  groupName: string; // 所在列表的组名
  groupNode: HTMLElement; // 所在列表的dom
  item: HTMLElement; // 拖拽元素
  index: number; // 位置序号
  draggableIndex?: number; // 拖拽前在列表中的序号(排除不可拖拽的元素)
}

// 拖拽项
export interface DragItem extends SortableItem {
  clone?: HTMLElement; // 拖拽元素的克隆体
}

// 可拖放的项
export interface DropItem extends DndBaseProps {
  groupName: string; // 所在列表的组名
  groupNode: HTMLElement; // 所在列表的dom
}

// 拖拽源信息
export interface DragParams {
  e: EventType;
  drag: DragItem;
}

// 是否激活
export enum ActiveTypes {
  Active = '0',
  NotActive = '1'
}

// 拖拽触发的函数的参数
export interface DndParams extends DragParams {
  drop?: SortableItem | DropItem
}

export interface DndBaseProps {
  onStart?: DndHandle; // 拖拽开始触发的函数
  onMove?: DndHandle; // 拖拽进行中触发的函数
  onEnd?: DndHandle; // 拖拽结束函数
  onAdd?: DndHandle; // 当前容器添加新元素触发的函数
  onUpdate?: DndHandle; // 当前容器排序触发的函数
  // 拖拽相关的配置
  options: {
    group: string;
    allowDrop: boolean; // 是否允许拖放新元素
    childDrag: boolean | (HTMLElement | string)[]; // 子元素是否允许拖拽
    sort?: boolean; // 是否允许排序
    direction?: string[]; // 允许拖拽的轴向
    sortSmallClass?: string; // 元素往序号小的排序时添加的class
    sortBigClass?: string; // 元素往序号大的排序时添加的class
    amimate?: { // 动画相关的配置

    }
  }
}

// 拖拽容器组件的props
export interface DndProps extends DndBaseProps {
  children: any;
  className?: string;
  style?: CSSProperties;
}

// 拖拽触发的函数
export type DndHandle = (params: DndParams) => void;
