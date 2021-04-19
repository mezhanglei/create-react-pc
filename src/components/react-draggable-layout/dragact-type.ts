import { GridItemEvent } from './gridItem';

// 布局中的拖拽元素的属性
export interface DragactLayoutItem {
    GridX: number
    GridY: number
    static?: Boolean
    w: number
    h: number
    isUserMove?: Boolean
    key?: number | string
    handle?: Boolean
    canDrag?: Boolean
    canResize?: Boolean
}

export interface DragactProps {
    // 布局的数据来源
    layout: DragactLayoutItem[];
    col: number;
    width: number;
    rowHeight: number;
    padding?: number;
    children: (Item: DragactLayoutItem, provided: {isDragging: Boolean}) => any,
    onDragStart?: (event: GridItemEvent, currentLayout: DragactLayoutItem[]) => void
    onDrag?: (event: GridItemEvent, currentLayout: DragactLayoutItem[]) => void
    onDragEnd?: (event: GridItemEvent, currentLayout: DragactLayoutItem[]) => void
    margin: [number, number];
    className: number | string;
    placeholder?: Boolean;
    style?: React.CSSProperties
}

export interface mapLayout {
    [key: string]: DragactLayoutItem
}

export interface DragactState {
    GridXMoving: number
    GridYMoving: number
    wMoving: number
    hMoving: number
    placeholderShow: Boolean
    placeholderMoving: Boolean
    layout: DragactLayoutItem[]
    containerHeight: number
    dragType: 'drag' | 'resize'
    mapLayout: mapLayout | undefined
}

export interface GridItemProvided {
    isDragging: Boolean
    dragHandle: any;
    resizeHandle: any;
    props: any;
}
