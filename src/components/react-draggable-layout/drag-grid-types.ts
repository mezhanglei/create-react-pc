import { EventType } from '../react-resize-zoom';
import { DragTypes, GridItemEvent } from './grid-item-types';

export type DragGridHandler = (layoutItem: GridItemEvent, oldLayout: GridItemEvent[], currentLayout?: GridItemEvent[], e?: EventType) => void;

export interface DragGridProps {
    layout: GridItemEvent[];
    cols: number;
    width: number;
    padding?: [number, number];
    rowHeight: number;
    margin: [number, number];
    children: any;
    onStart?: DragGridHandler;
    onMove?: DragGridHandler;
    onEnd?: DragGridHandler;
    onResizeStart?: DragGridHandler;
    onResizing?: DragGridHandler;
    onResizeEnd?: DragGridHandler;
    className: number | string;
    style?: React.CSSProperties;
}

export interface DragGridState {
    layout: GridItemEvent[];
    parentDragType?: DragTypes;
}

export interface GridItemProvided {
    isDragging: Boolean
}
