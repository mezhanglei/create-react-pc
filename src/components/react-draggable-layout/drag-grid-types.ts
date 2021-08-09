import { EventType } from '../react-resize-zoom';
import { DragTypes, GridItemEvent } from './grid-item-types';

export type DragGridHandler = (layoutItem: GridItemEvent, oldLayout: GridItemEvent[], currentLayout?: GridItemEvent[], e?: EventType) => void;

export interface DragGridProps {
    layout: GridItemEvent[]
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
    [key: string]: GridItemEvent
}

export interface DragGridState {
    layout: GridItemEvent[];
    containerHeight?: number;
    parentDragType?: `${DragTypes}`;
    mapLayout?: MapLayout;
}

export interface GridItemProvided {
    isDragging: Boolean
}
