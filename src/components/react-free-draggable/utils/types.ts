import { CSSProperties } from "react";

// 事件对象
export type EventType = MouseEvent | TouchEvent;

export interface LastEventData {
    lastX: number; // 上个位置x
    lastY: number; // 上个位置y
}
// 拖拽元素的位置接口
export interface EventData extends LastEventData {
    node?: any; // 节点
    deltaX: number; // x方向移动的距离
    deltaY: number; // y方向移动的距离
    x: number; // 当前位置x
    y: number; // 当前位置y
    zIndex?: number; // 层级
}

// 位置类型
export interface PositionType {
    x: number;
    y: number;
}

// 轴的类型
// 轴的类型
export type AxisType = "both" | "x" | "y" | "none";

// 限制范围的类型
export interface BoundsInterface {
    xStart: number;
    xEnd: number;
    yStart: number;
    yEnd: number;
}

// DraggableEvent的props的类型
export interface DraggableEventProps {
    children: any;
    onDragStart?: (e: EventType, position?: EventData) => void | boolean; // 拖拽开始事件
    onDrag?: (e: EventType, position?: EventData) => void | boolean; // 拖拽进行事件
    onDragStop?: (e: EventType, position?: EventData) => void | boolean; // 拖拽结束事件
    allowAnyClick?: boolean; // 表示允许非鼠标左键单击拖动
    disabled?: boolean; // 禁止拖拽
    dragNode?: string | HTMLElement; // 拖拽元素的类选择器
    disabledNode?: string | HTMLElement; // 不允许拖拽的选择器
    enableUserSelectHack?: boolean; // 允许添加选中样式
    grid?: [number, number]; // 设置x,y方向的拖拽幅度，多少幅度移动一次目标
    boundsParent?: string | HTMLElement; // 限制拖拽的父元素，默认body
}

// Draggable的props的类型
export interface DraggableProps extends DraggableEventProps {
    scale?: number; // 拖拽灵敏度
    position?: PositionType; // 拖拽元素在父元素内的受控位置（不会受到bounds和boundsParent影响）
    axis: AxisType; // 限制拖拽的方向
    positionOffset?: PositionType; // 接收偏移位置（不受bounds和boundsParent影响）
    bounds?: BoundsInterface; // 在boundsParent元素内部范围的限制拖拽范围
    zIndexRange?: [number, number] // zIndex的变化范围
    className?: string;
    style?: CSSProperties;
}

// 事件处理函数的type
export type EventHandler<T> = (e: T) => void | boolean;
// 拖拽处理函数的type
export type DragHandler<T> = (e: T, data?: EventData) => void | boolean;
