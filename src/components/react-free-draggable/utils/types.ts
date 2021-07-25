import { CSSProperties } from "react";

// 事件对象
export type EventType = MouseEvent | TouchEvent;

// 事件对象的位置接口
export interface EventData {
    node?: any; // 节点
    deltaX: number; // x方向移动的距离
    deltaY: number; // y方向移动的距离
    eventX: number; // 事件对象位置x
    eventY: number; // 事件对象位置y
    lastEventX: number; // 上个事件对象位置x
    lastEventY: number; // 上个事件对象位置y
}

// 拖拽元素的位置接口
export interface DragData {
    node?: any; // 节点
    deltaX: number; // x方向移动的距离
    deltaY: number; // y方向移动的距离
    x?: number; // 元素在页面中的位置x
    y?: number; // 元素在页面中的位置y
    translateX: number; // 当前x轴的translate
    translateY: number; // 当前y轴的translate
    zIndex?: number; // 层级
    lastX?: number; // 上个位置x
    lastY?: number; // 上个位置y
}

// 位置类型
export interface PositionType {
    x: number;
    y: number;
}

// 轴的类型
export enum DragAxis {
    x = 'x',
    y = 'y',
    both = 'both',
    none = 'none'
}

// 限制范围的类型
export interface BoundsInterface {
    left: number;
    right: number;
    top: number;
    bottom: number;
    boundsParent: string | HTMLElement;
}

// DraggableEvent的props的类型
export interface DraggableEventProps {
    children: any;
    onDragStart?: EventHandler; // 拖拽开始事件
    onDrag?: EventHandler; // 拖拽进行事件
    onDragStop?: EventHandler; // 拖拽结束事件
    allowAnyClick?: boolean; // 表示允许非鼠标左键单击拖动
    disabled?: boolean; // 禁止拖拽
    dragNode?: string | HTMLElement; // 拖拽句柄的类选择器
    disabledNode?: string | HTMLElement; // 不允许拖拽的选择器
    enableUserSelectHack?: boolean; // 允许添加选中样式
    grid?: [number, number]; // 设置x,y方向的拖拽幅度，多少幅度移动一次目标
    locationParent?: string | HTMLElement; // 定位父元素, 设置之后拖拽过程的位置以父元素作为参考
}

// Draggable的props的类型
export interface DraggableProps {
    children: any;
    allowAnyClick?: boolean; // 表示允许非鼠标左键单击拖动
    disabled?: boolean; // 禁止拖拽
    dragNode?: string | HTMLElement; // 拖拽句柄的类选择器
    disabledNode?: string | HTMLElement; // 不允许拖拽的选择器
    enableUserSelectHack?: boolean; // 允许添加选中样式
    grid?: [number, number]; // 设置x,y方向的拖拽幅度，多少幅度移动一次目标
    scale?: number; // 拖拽灵敏度
    x?: number; // 在页面中的位置
    y?: number; // 在页面中的位置
    axis?: `${DragAxis}`; // 限制拖拽的方向
    positionOffset?: PositionType; // 接收偏移位置（不受bounds影响）
    bounds?: string | HTMLElement | BoundsInterface; // 限制拖拽的父元素，默认body, 或者在bounds.boundsParent元素内部范围的限制拖拽范围
    zIndexRange?: [number, number]; // zIndex的变化范围
    reset?: boolean; // 重置transform
    className?: string;
    style?: CSSProperties;
    transform?: string;
    onDragStart?: DragHandler; // 拖拽开始事件
    onDrag?: DragHandler; // 拖拽进行事件
    onDragStop?: DragHandler; // 拖拽结束事件
}

// 事件处理函数的type
export type EventHandler<E = EventType, T = EventData> = (e: E, data?: T) => void | boolean;
export type DragHandler<E = EventType, T = DragData> = (e: E, data?: T) => void | boolean;