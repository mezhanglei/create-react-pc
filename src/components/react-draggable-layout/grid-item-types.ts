import { ResizeAxis } from "@/components/react-resize-zoom";
import { DragAxis, BoundsInterface } from "@/components/react-free-draggable";

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
    GridX: number;
    GridY: number;
    w: number;
    h: number;
    margin?: [number, number];
    uniqueKey: string | number;
    isMove?: boolean; // 是否移动
    forbid?: boolean; // 禁止拖拽和移动
    bounds?: string | HTMLElement | BoundsInterface; // 定位父元素
    handle?: string | HTMLElement; // 拖拽句柄
    dragAxis?: DragAxis; // 允许的拖拽类型
    resizeAxis?: ResizeAxis; // 允许缩放类型
    zIndexRange?: [number, number];
}
export type GridItemEventHandle = (data: GridItemEvent, e: EventType) => void;
export interface GridItemProps extends GridItemEvent {
    /**外部容器属性 */
    cols: number;
    containerWidth: number;
    containerPadding: [number, number];
    rowHeight: number;

    onDragStart?: GridItemEventHandle;
    onDragEnd?: GridItemEventHandle;
    onDrag?: GridItemEventHandle;
    onResizeStart?: GridItemEventHandle;
    onResizing?: GridItemEventHandle;
    onResizeEnd?: GridItemEventHandle;
    parentDragType?: `${DragTypes}`; // 父元素内发生的拖拽类型
    children: any;
    className?: string;
    style?: React.CSSProperties;
}