import { BoundsInterface } from "@/components/react-free-draggable";
import { Direction } from "@/components/react-resize-zoom";

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
    uniqueKey?: string | number;
    forbid?: boolean; // 禁止拖拽和移动
    bounds?: string | HTMLElement | BoundsInterface; // 定位父元素
    handle?: string | HTMLElement; // 拖拽句柄
    dragAxis?: string[]; // 允许的拖拽类型
    resizeAxis?: Direction[]; // 允许缩放类型
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
    children: any;
    className?: string;
    style?: React.CSSProperties;
}