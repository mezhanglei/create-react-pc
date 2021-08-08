import { GridItemEvent, DragTypes } from './grid-item-types';

export interface DragGridLayoutItem {
    GridX: number;
    GridY: number;
    w: number;
    h: number;
    isMove?: boolean;
    key: number | string;
    forbid?: boolean; // 是否静态组件
}

export type DragGridHandler = (layoutItem: GridItemEvent, oldLayout: DragGridLayoutItem[], currentLayout?: DragGridLayoutItem[]) => void;

export interface DragGridProps {
    layout: DragGridLayoutItem[]
    cols: number;
    width: number;
    padding?: [number, number];
    rowHeight: number;
    margin: [number, number];
    children: any;
    onDragStart?: DragGridHandler;
    onDrag?: DragGridHandler;
    onDragEnd?: DragGridHandler;
    onResizeStart?: DragGridHandler;
    onResizing?: DragGridHandler;
    onResizeEnd?: DragGridHandler;
    className: number | string;
    style?: React.CSSProperties;
}

export interface MapLayout {
    [key: string]: DragGridLayoutItem
}

export interface DragGridState {
    layout: DragGridLayoutItem[];
    containerHeight?: number;
    parentDragType?: `${DragTypes}`;
    mapLayout?: MapLayout;
}

export interface GridItemProvided {
    isDragging: Boolean
}
