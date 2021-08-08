import { GridItemEvent, DragTypes } from './grid-item-types';

export interface DragactLayoutItem {
    GridX: number;
    GridY: number;
    w: number;
    h: number;
    isMove?: boolean;
    key?: number | string;
    static?: boolean; // 是否静态组件
}

export type DragGridHandler = (layoutItem: GridItemEvent, oldLayout: DragactLayoutItem[], currentLayout?: DragactLayoutItem[]) => void;

export interface DragactProps {
    layout: DragactLayoutItem[]
    col: number;
    width: number;
    rowHeight: number;
    padding?: number;
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
    [key: string]: DragactLayoutItem
}

export interface DragactState {
    layout: DragactLayoutItem[];
    containerHeight?: number;
    parentDragType?: `${DragTypes}`;
    mapLayout?: MapLayout;
}

export interface GridItemProvided {
    isDragging: Boolean
}
