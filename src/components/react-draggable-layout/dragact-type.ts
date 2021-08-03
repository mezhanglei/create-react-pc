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

export interface DragactProps {
    layout: DragactLayoutItem[]
    /** 
     * 宽度切分比 
     * 这个参数会把容器的宽度平均分为col等份
     * 于是容器内元素的最小宽度就等于 containerWidth/col
    */
    col: number,

    /** 
     * 容器的宽度
    */
    width: number,

    /**容器内每个元素的最小高度 */
    rowHeight: number,

    /**
     * 容器内部的padding
     */
    padding?: number,

    children: any,

    /**
     * 拖动开始的回调
     */
    onDragStart?: (e: GridItemEvent, currentLayout: DragactLayoutItem[]) => void

    /**
     * 拖动中的回调
     */
    onDrag?: (e: GridItemEvent, currentLayout: DragactLayoutItem[]) => void

    /**
     * 拖动结束的回调
     */
    onDragEnd?: (e: GridItemEvent, currentLayout: DragactLayoutItem[]) => void

    /**
     * 每个元素的margin,第一个参数是左右，第二个参数是上下
     */
    margin: [number, number];
    className: number | string;
    style?: React.CSSProperties;
    // layout的onChange事件
    onChange?: (item: DragactLayoutItem, oldLayout: DragactLayoutItem[], layout: DragactLayoutItem[]) => void;
}

export interface MapLayout {
    [key: string]: DragactLayoutItem
}

export interface DragactState {
    layout: DragactLayoutItem[];
    containerHeight: number;
    parentDragType?: `${DragTypes}`;
    mapLayout?: MapLayout;
}

export interface GridItemProvided {
    isDragging: Boolean
}
