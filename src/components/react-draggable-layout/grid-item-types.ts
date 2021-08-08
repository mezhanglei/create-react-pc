import { ResizeAxis } from "./react-resize-zoom";
import { DragAxis, BoundsInterface } from "./react-free-draggable";

export type EventType = MouseEvent | TouchEvent;
// 拖拽类型
export enum DragTypes {
    dragStart = 'dragStart',
    draging = 'draging',
    dragEnd = 'dragEnd',
    resizeStart = 'resizeStart',
    resizing = 'resizing',
    resizeEnd = 'resizeEnd'
}
export interface GridItemEvent {
    e: EventType;
    GridX: number;
    GridY: number;
    w: number;
    h: number;
    uniqueKey: string | number;
}
export type GridItemEventHandle = (data: GridItemEvent) => void;
export interface GridItemProps {
    /**外部容器属性 */
    cols: number,
    containerWidth: number,
    containerPadding: [number, number],
    rowHeight: number,

    /**子元素的属性 */
    margin?: [number, number],
    GridX: number,
    GridY: number,
    w: number,
    h: number,

    onDragStart?: GridItemEventHandle;
    onDragEnd?: GridItemEventHandle;
    onDrag?: GridItemEventHandle;
    onResizeStart?: GridItemEventHandle;
    onResizing?: GridItemEventHandle;
    onResizeEnd?: GridItemEventHandle;

    uniqueKey?: string | number;
    parentDragType?: `${DragTypes}`; // 父元素内发生的拖拽类型
    isMove?: boolean; // 是否移动
    forbid?: boolean; // 禁止拖拽和移动
    bounds?: string | HTMLElement | BoundsInterface; // 定位父元素
    handle?: string | HTMLElement; // 拖拽句柄
    dragAxis?: DragAxis; // 允许的拖拽类型
    resizeAxis?: ResizeAxis; // 允许缩放类型
    zIndexRange?: [number, number];
    children: any;
    className?: string;
    style?: React.CSSProperties;
}