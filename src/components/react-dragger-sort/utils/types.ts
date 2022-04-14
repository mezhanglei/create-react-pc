import { CSSProperties } from "react";

export type EventType = MouseEvent | TouchEvent;

export enum DropEffect {
  None = 'none', // 不能把元素拖放至此
  Move = 'move', // 移动到目标
  Copy = 'copy', // 复制到目标
  Link = 'link' // 目标打开拖动元素（拖动元素必须是链接并有URL）
}

// 拖拽区域信息
export interface DndSortable {
  groupPath?: string; // group位置路径，'.' 分割
  groupNode: HTMLElement; // 所在列表的dom
  props: DndBaseProps; // 所在区域的props
}

// 可排序项
export interface SortableItem extends DndSortable {
  item: HTMLElement & { animated?: boolean }; // 拖拽元素
  index: number; // 位置序号
  draggableIndex?: number; // 位置序号(排除不可拖拽的元素)
  path: string; // 位置路径，'.' 分割
}

// 拖拽项
export interface DragItem extends SortableItem {
  clone?: HTMLElement; // 拖拽元素的克隆体
}

// 拖放项
export interface DropItem extends DndSortable {
  item?: HTMLElement & { animated?: boolean }; // 拖放over的目标
  index?: number; // 原位置序号
  draggableIndex?: number; // 原位置序号(排除不可拖拽的元素)
  path?: string; // 位置路径，'.' 分割
  dropIndex: number; // 拖放的位置序号
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
  drop: DropItem
}

// 拖拽过程触发的函数的参数
export interface DndMoveParams extends DragParams {
  drop?: SortableItem | DndSortable
}

// 拖拽触发的函数
export type DndHandle = (params: DndParams) => void;
export type DragHandle = (params: DndMoveParams) => void;

export interface DndBaseProps {
  onStart?: DragHandle; // 拖拽开始触发的函数
  onMove?: DragHandle; // 拖拽进行中触发的函数
  onEnd?: DragHandle; // 拖拽结束函数
  onAdd?: DndHandle; // 当前容器添加新元素触发的函数
  onUpdate?: DndHandle; // 当前容器排序触发的函数
  // 拖拽相关的配置
  options: {
    groupPath?: string; // 拖拽容器的路径
    handle?: string; // 拖拽句柄
    filter?: string; // 过滤句柄的选择器
    allowDrop: boolean; // 是否允许拖放新元素
    allowSort?: boolean; // 是否可以动态插入排序
    childDrag: boolean | (HTMLElement | string)[]; // 子元素是否允许拖拽
    direction?: string[]; // 允许拖拽的轴向
    sortSmallClass?: string; // 元素往序号小的排序时添加的class
    sortBigClass?: string; // 元素往序号大的排序时添加的class
  }
}

// 拖拽容器组件的props
export interface DndProps extends DndBaseProps {
  children: any;
  className?: string;
  style?: CSSProperties;
}
