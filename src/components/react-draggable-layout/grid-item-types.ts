import { BoundsInterface } from "@/components/react-free-draggable";

export type EventType = MouseEvent | TouchEvent;
// 拖拽类型
export enum DragTypes {
  Start = 'start',
  Move = 'move',
  End = 'end',
  ResizeStart = 'resizeStart',
  Resizing = 'resizing',
  ResizeEnd = 'resizeEnd'
}
export interface GridItemEvent {
  GridX?: number; // 单位 width / cols
  GridY?: number; // 单位 rowHeight
  w?: number; // 单位 width / cols
  h?: number; // 单位 rowHeight 
  margin?: [number, number];
  uniqueKey?: string | number;
  forbid?: boolean; // 禁止拖拽和移动
  bounds?: string | HTMLElement | BoundsInterface; // 定位父元素
  handle?: string | HTMLElement; // 拖拽句柄
  direction?: string[] // 允许拖拽的位置
}
export type GridItemEventHandle = (data: GridItemEvent, e: EventType) => void;
export interface GridItemProps extends GridItemEvent {
  /**外部容器属性 */
  cols: number; // 一行多少列
  containerWidth: number;
  containerPadding: [number, number];
  rowHeight: number; // 行高

  onStart?: GridItemEventHandle;
  onMove?: GridItemEventHandle;
  onEnd?: GridItemEventHandle;
  onResizeStart?: GridItemEventHandle;
  onResizing?: GridItemEventHandle;
  onResizeEnd?: GridItemEventHandle;
  children: any;
  className?: string;
  style?: React.CSSProperties;
};
