import React, { CSSProperties } from "react";

// 事件对象
export type EventType = MouseEvent | TouchEvent;

// 拖拽元素的位置接口
export type DragEventData = {
  target?: any; // 节点
  deltaX: number; // x方向移动的距离
  deltaY: number; // y方向移动的距离
  eventX: number; // 事件对象位置x
  eventY: number; // 事件对象位置y
  lastEventX: number; // 上个事件对象位置x
  lastEventY: number; // 上个事件对象位置y
}

// 拖拽元素的位置接口
export interface DragData extends DragEventData {
  x?: number; // 元素在页面中的位置x
  y?: number; // 元素在页面中的位置y
  translateX?: number; // 当前x轴的translate
  translateY?: number; // 当前y轴的translate
}

// 位置类型
export interface PositionType {
  x: number;
  y: number;
}

// 拖拽方位
export enum DragDirection {
  Vertical = 'vertical', // 竖直
  Horizontal = 'horizontal' // 水平
}

export const DragDirectionCode = Object.values(DragDirection);

// 限制范围的类型
export interface BoundsInterface {
  left: number;
  right: number;
  top: number;
  bottom: number;
  element: string | HTMLElement;
}

// 基础拖拽属性
export interface BaseDragProps extends React.HtmlHTMLAttributes<HTMLElement> {
  children?: any;
  className?: string;
  style?: CSSProperties;
  direction?: string[]; // 限制拖拽的方向
  scale?: number; // 拖拽灵敏度
  allowAnyClick?: boolean; // 表示允许非鼠标左键单击拖动
  disabled?: boolean; // 禁止拖拽
  handle?: string | HTMLElement; // 拖拽句柄的类选择器
  filter?: string | HTMLElement; // 不允许拖拽的选择器
  enableUserSelectHack?: boolean; // 允许添加选中文本样式
  grid?: [number, number]; // 设置x,y方向的拖拽幅度，多少幅度移动一次目标
  eventBounds?: string | HTMLElement; // 限制事件对象的触发范围
  forwardedRef?: any;
}

// DraggableEvent的props的类型
export interface DraggableEventProps extends BaseDragProps {
  onStart?: EventHandler; // 拖拽开始事件
  onMove?: EventHandler; // 拖拽进行事件
  onEnd?: EventHandler; // 拖拽结束事件
}

// Draggable的props的类型
export interface DraggableProps extends BaseDragProps {
  children?: any;
  x?: number; // 受控位置，参考系位置为bounds的位置
  y?: number; // 受控位置，参考系位置为bounds的位置
  positionOffset?: PositionType; // 接收偏移位置（不受bounds影响）
  bounds?: string | HTMLElement | BoundsInterface; // 限制拖拽的父元素，默认body, 或者在bounds.element元素内部范围的限制拖拽范围
  resetOnEnd?: boolean; // 结束时还原位置
  transform?: string; // 设置transform属性
  onStart?: DragHandler; // 拖拽开始事件
  onMove?: DragHandler; // 拖拽进行事件
  onEnd?: DragHandler; // 拖拽结束事件
}

// 拖拽类型
export enum DragTypes {
  Start = 'start',
  Move = 'move',
  End = 'end'
}

export interface DraggableState {
  dragData?: DragData;
  dragType?: DragTypes;
  isSVG: boolean;
  prevX?: number;
  prevY?: number;
}

// 事件处理函数的type
export type EventHandler<E = EventType, D = DragEventData> = (e: E, data?: D) => void | boolean;
export type DragHandler<E = EventType, D = DragData> = (e: E, data?: D) => void | boolean;
