import React, { useEffect, useRef, useState, CSSProperties, useImperativeHandle } from 'react';
import ResizeZoom from "@/components/react-resize-zoom";
import { EventType as ResizeEventType, EventHandler as ResizeEventHandler } from "@/components/react-resize-zoom/type";
import Draggable, { EventType as DragEventType, DragHandler as DragEventHandler, BoundsInterface } from "@/components/react-free-draggable";
import { ChildrenType } from "./types";
import { checkInContainer } from './utils';
import classNames from "classnames";

// 事件对象
export type EventType = MouseEvent | TouchEvent;
export type GridItemHandler<E = EventType, T = GridItemEvent> = (e: E, data: T) => void | boolean;
export interface GridItemEvent {
    GridX: number
    GridY: number
    w: number
    h: number
    UniqueKey: string | number
}
export interface SideAttribute {
    top: number;
    right: number;
    bottom: number;
    left: number;
}
export interface GridItemProps {
    children: ChildrenType;
    className?: string;
    style?: CSSProperties;
    onDragStart?: GridItemHandler;
    onDrag?: GridItemHandler;
    onDragEnd?: GridItemHandler;
    onResizeStart?: GridItemHandler;
    onResizing?: GridItemHandler;
    onResizeEnd?: GridItemHandler;
    containerWidth: number;  // 容器宽度 单位px
    containerPadding: [number, number]; // 水平竖直的padding
    col: number; // 横轴分成多少列
    margin?: [number, number]; // 水平，竖直的margin
    GridX: number; // 横轴坐标
    GridY: number; // 纵轴坐标
    rowHeight: number; // 行高
    w: number; // 宽，单位col
    h: number; // 高，单位col
    UniqueKey?: string;
    isUserMove?: Boolean;
    bounds?: string | HTMLElement | BoundsInterface;
    dragType?: 'drag' | 'resize';
    forbid?: boolean;
}

const GridItem = React.forwardRef<any, GridItemProps>((props, ref) => {

    const {
        children,
        className,
        style,
        containerWidth = 500,
        col = 12,
        containerPadding = [0, 0],
        margin = [0, 0],
        w = 1,
        h = 2,
        rowHeight = 30,
        GridX,
        GridY,
        UniqueKey,
        isUserMove,
        bounds,
        forbid
    } = props;
    

    const onDragStart: DragEventHandler = (e, data) => {

        if (forbid || !data) return;
        const { x, y } = data;
        const { GridX, GridY } = calPxToGrid(x, y)
        props.onDragStart && props.onDragStart(e, { GridX, GridY, w, h, UniqueKey: UniqueKey + '' })
    }

    const onDrag: DragEventHandler = (e, data) => {
        if (forbid || !data) return;
        const { x, y } = data;
        const { GridX, GridY } = calPxToGrid(x, y);
        props.onDrag && props.onDrag(e, { GridX, GridY, w, h, UniqueKey: UniqueKey + '' })
    }

    const onDragStop: DragEventHandler = (e, data) => {
        if (forbid || !data) return;
        const { x, y } = data;
        const { GridX, GridY } = calPxToGrid(x, y);
        props.onDragEnd && props.onDragEnd(e, { GridX, GridY, w, h, UniqueKey: UniqueKey + '' });
    }

    const onResizeStart: ResizeEventHandler = (e, data) => {

        props.onResizeStart && props.onResizeStart(e, { GridX, GridY, w, h, UniqueKey: UniqueKey + '' })
    }

    const onResizing: ResizeEventHandler = (e, data) => {
        if (!data) return;
        const { w, h } = calPxToWH(data?.width, data?.height);
        props.onResizing && props.onResizing(e, { GridX, GridY, w, h, UniqueKey: UniqueKey + '' })
    }

    const onResizeEnd: ResizeEventHandler = (e, data) => {
        if (!data) return;
        const { w, h } = calPxToWH(data?.width, data?.height);
        props.onResizeEnd && props.onResizeEnd(e, { GridX, GridY, w, h, UniqueKey: UniqueKey + '' })
    }

    // 计算容器的每一个格子多宽
    const calColWidth = () => {
        return (containerWidth - containerPadding[0] * 2 - margin[0] * (col + 1)) / col;
    }

    // col单位 => px单位
    const calWHtoPx = (w: number, h: number) => {
        const wPx = Math.round(w * calColWidth() + (w - 1) * margin[0])
        const hPx = Math.round(h * rowHeight + (h - 1) * margin[1])
        return { wPx, hPx }
    }

    // px单位 => col单位
    const calPxToWH = (wPx: number, hPx: number) => {
        const calWidth = calColWidth();

        const w = Math.round((wPx - calWidth * 0.5) / calWidth)
        const h = Math.round((hPx - rowHeight * 0.5) / rowHeight)
        return checkWidthHeight(GridX, w, h, col)
    }

    const checkWidthHeight = (GridX: number, w: number, h: number, col: number) => {
        let newW = w;
        let newH = h;
        if (GridX + w > col - 1) newW = col - GridX //右边界
        if (w < 1) newW = 1;
        if (h < 1) newH = 1;
        return {
            w: newW, h: newH
        }
    }

    // Grid位置转化为px位置
    const calGridToPx = (GridX: number, GridY: number) => {
        let x = Math.round(GridX * calColWidth() + (GridX + 1) * margin[0])
        let y = Math.round(GridY * rowHeight + margin[1] * (GridY + 1))

        return {
            x: x,
            y: y
        }
    }

    const calPxToGrid = (x: number, y: number) => {
        // 坐标转换成格子的时候，无须计算margin
        let GridX = Math.round(x / containerWidth * col)
        let GridY = Math.round(y / (rowHeight + (margin ? margin[1] : 0)))

        // 防止元素出container
        return checkInContainer(GridX, GridY, col, w)
    }

    // 包裹元素的className
    const cls = classNames((children.props.className || ''), className);

    const { wPx, hPx } = calWHtoPx(w, h);
    const { x, y } = calGridToPx(GridX, GridY);

    return (
        <Draggable
            onDragStart={onDragStart}
            onDrag={onDrag}
            onDragStop={onDragStop}
            x={x}
            y={y}
            bounds={bounds}
        >
            <ResizeZoom
                onResizeStart={onResizeStart}
                onResizeMoving={onResizing}
                onResizeEnd={onResizeEnd}
                width={wPx}
                height={hPx}
            >
                {
                    React.cloneElement(React.Children.only(children), {
                        className: cls,
                        style: {
                            ...children.props.style,
                            ...style,
                            position: 'absolute',
                            transition: isUserMove ? '' : 'all .2s ease-out',
                            // zIndex: isUserMove ? (dragType === 'drag' ? 10 : 2) : 2
                        }
                    })
                }
            </ResizeZoom>
        </Draggable>
    );
});

export default GridItem;