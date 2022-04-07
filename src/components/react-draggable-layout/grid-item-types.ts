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
export enum DragDirection {
  Vertical = 'vertical', // 竖直
  Horizontal = 'horizontal', // 水平
  N = "n", // 上边
  S = "s", // 下边
  W = "w", // 左边
  E = "e", // 右边
  NE = "ne", // 右上
  NW = "nw", // 左上
  SE = "se", // 右下
  SW = "sw", // 左下
}
export const DragDirectionCode = Object.values(DragDirection);
export interface GridItemEvent {
  GridX?: number;
  GridY?: number;
  w?: number;
  h?: number;
  margin?: [number, number];
  uniqueKey?: string | number;
  forbid?: boolean; // 禁止拖拽和移动
  bounds?: string | HTMLElement | BoundsInterface; // 定位父元素
  handle?: string | HTMLElement; // 拖拽句柄
  direction?: string[] // 拖拽方位
}
export type GridItemEventHandle = (data: GridItemEvent, e: EventType) => void;
export interface GridItemProps extends GridItemEvent {
  /**外部容器属性 */
  cols: number;
  containerWidth: number;
  containerPadding: [number, number];
  rowHeight: number;

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
