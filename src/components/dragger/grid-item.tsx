import React, { useEffect, useRef, useState, CSSProperties, useImperativeHandle } from 'react';
import ResizeZoom from "@/components/react-resize-zoom";
import { EventType as ResizeEventType, EventHandler as ResizeEventHandler } from "@/components/react-resize-zoom/type";
import Draggable, { EventType as DragEventType, DragHandler as DragEventHandler, BoundsInterface } from "@/components/react-free-draggable";
import { ChildrenType } from "./types";
import classNames from "classnames";

export type EventType = MouseEvent | TouchEvent;
export type DraggerHandler<E = EventType, T = DraggerItemEvent> = (e: E, data: T) => void | boolean;
export interface DraggerItemEvent {
    width: number;
    height: number;
    x: number;
    y: number;
    id: string | number;
    node: HTMLElement;
}
export interface DraggerProps {
    children: ChildrenType;
    className?: string;
    style?: CSSProperties;
    onDragStart?: DraggerHandler;
    onDrag?: DraggerHandler;
    onDragEnd?: DraggerHandler;
    onResizeStart?: DraggerHandler;
    onResizing?: DraggerHandler;
    onResizeEnd?: DraggerHandler;
    id: string | number;
    bounds?: string | HTMLElement | BoundsInterface;
    type?: 'drag' | 'resize' | 'both' | 'none'; // 允许操作的类型
}

// 非受控拖拽组件
const DraggerItem = React.forwardRef<any, DraggerProps>((props, ref) => {

    const {
        children,
        className,
        style,
        type = "both",
        bounds
    } = props;

    const [dragType, setDragType] = useState<'drag' | 'resize' | 'none'>();

    // 可以拖拽
    const canDrag = () => {
        return ['drag', 'both']?.includes(type)
    }

    // 可以调整尺寸
    const canResize = () => {
        return ['resize', 'both']?.includes(type)
    }


    const onDragStart: DragEventHandler = (e, data) => {
        if (!canDrag()) return false;
        setDragType('drag');
        // props.onDragStart && props.onDragStart(e, )
    }

    const onDrag: DragEventHandler = (e, data) => {
        if (!canDrag()) return false;
        // props.onDrag && props.onDrag(e, )
    }

    const onDragStop: DragEventHandler = (e, data) => {
        if (!canDrag()) return false;
        setDragType('none');
        // props.onDragEnd && props.onDragEnd(e, );
    }

    const onResizeStart: ResizeEventHandler = (e, data) => {
        if (!canResize()) return false;
        setDragType('resize');
        // props.onResizeStart && props.onResizeStart(e, )
    }

    const onResizing: ResizeEventHandler = (e, data) => {
        if (!canResize()) return false;
        // props.onResizing && props.onResizing(e, )
    }

    const onResizeEnd: ResizeEventHandler = (e, data) => {
        if (!canResize()) return false;
        setDragType('none');
        // props.onResizeEnd && props.onResizeEnd(e, )
    }

    const cls = classNames((children.props.className || ''), className);

    return (
        <Draggable
            onDragStart={onDragStart}
            onDrag={onDrag}
            onDragStop={onDragStop}
            bounds={bounds}
        >
            <ResizeZoom
                onResizeStart={onResizeStart}
                onResizeMoving={onResizing}
                onResizeEnd={onResizeEnd}
            >
                {
                    React.cloneElement(React.Children.only(children), {
                        className: cls,
                        style: {
                            ...children.props.style,
                            ...style,
                            transition: dragType && dragType != 'none' && (canDrag() || canResize()) ? '' : 'all .2s ease-out',
                            zIndex: dragType && dragType != 'none' && (canDrag() || canResize()) ? (dragType === 'drag' ? 10 : 2) : 2
                        }
                    })
                }
            </ResizeZoom>
        </Draggable>
    );
});


export type GridItemHandler<E = EventType, T = GridItemEvent> = (e: E, data: T) => void | boolean;
export interface GridItemEvent {
    gridX: number;
    gridY: number;
    gridW: number;
    gridH: number;
    id: string | number;
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
    gridX: number; // 横轴坐标，单位col
    gridY: number; // 纵轴坐标，单位col
    rowHeight: number; // 行高
    gridW: number; // 宽，单位col
    gridH: number; // 高，单位col
    id: string | number;
    bounds?: string | HTMLElement | BoundsInterface;
    type?: 'drag' | 'resize' | 'both' | 'none'; // 允许操作的类型
}

// 受控拖拽组件
const GridItem = React.forwardRef<any, GridItemProps>((props, ref) => {

    const {
        children,
        className,
        style,
        containerWidth = 500,
        col = 12,
        containerPadding = [0, 0],
        margin = [0, 0],
        rowHeight = 30,
        type = "both",
        bounds
    } = props;

    const [dragType, setDragType] = useState<'drag' | 'resize' | 'none'>();

    const [gridX, setGridX] = useState<number>(0);
    const [gridY, setGridY] = useState<number>(0);
    const [gridW, setGridW] = useState<number>(1);
    const [gridH, setGridH] = useState<number>(2);

    // 更新
    useEffect(() => {
        if (props?.gridX != undefined && !dragType) {
            setGridX(props?.gridX)
        }
        if (props?.gridY != undefined && !dragType) {
            setGridY(props?.gridY)
        }
    }, [props?.gridX, props?.gridY, dragType]);

    useEffect(() => {
        if (props?.gridW != undefined && !dragType) {
            setGridW(props?.gridW)
        }
        if (props?.gridH != undefined && !dragType) {
            setGridH(props?.gridH)
        }
    }, [props?.gridH, props?.gridH, dragType]);


    // 可以拖拽
    const canDrag = () => {
        return ['drag', 'both']?.includes(type)
    }

    // 可以调整尺寸
    const canResize = () => {
        return ['resize', 'both']?.includes(type)
    }


    const onDragStart: DragEventHandler = (e, data) => {
        if (!canDrag()) return false;
        setDragType('drag');
        // props.onDragStart && props.onDragStart(e, )
    }

    const onDrag: DragEventHandler = (e, data) => {
        if (!canDrag()) return false;
        // props.onDrag && props.onDrag(e, )
    }

    const onDragStop: DragEventHandler = (e, data) => {
        if (!canDrag()) return false;
        setDragType('none');
        // props.onDragEnd && props.onDragEnd(e, );
    }

    const onResizeStart: ResizeEventHandler = (e, data) => {
        if (!canResize()) return false;
        setDragType('resize');
        // props.onResizeStart && props.onResizeStart(e, )
    }

    const onResizing: ResizeEventHandler = (e, data) => {
        if (!canResize()) return false;
        // props.onResizing && props.onResizing(e, )
    }

    const onResizeEnd: ResizeEventHandler = (e, data) => {
        if (!canResize()) return false;
        setDragType('none');
        // props.onResizeEnd && props.onResizeEnd(e, )
    }

    // 计算容器的每一个格子多宽
    const calColWidth = () => {
        return (containerWidth - containerPadding[0] * 2 - margin[0] * (col + 1)) / col;
    }

    // col单位 => px单位
    const calWHtoPx = (gridW: number, gridH: number) => {
        const w = Math.round(gridW * calColWidth() + (gridW - 1) * margin[0])
        const h = Math.round(gridH * rowHeight + (gridH - 1) * margin[1])
        return { w, h }
    }

    // px单位 => col单位（四舍五入取整）
    const calPxToWH = (w: number, h: number) => {
        const calWidth = calColWidth();

        const newW = Math.round((w - calWidth * 0.5) / calWidth)
        const newH = Math.round((h - rowHeight * 0.5) / rowHeight)
        return checkWH(gridX, newW, newH, col)
    }

    // 返回边界内的位置
    const checkGrid = (gridX: number, gridY: number, col: number, gridW: number) => {

        /**防止元素出container */
        if (gridX + gridW > col - 1) gridX = col - gridW //右边界
        if (gridX < 0) gridX = 0 //左边界
        if (gridY < 0) gridY = 0 //上边界
        return { gridX, gridY }
    }

    // 返回宽高边界
    const checkWH = (gridX: number, w: number, h: number, col: number) => {
        let newW = w;
        let newH = h;
        if (gridX + w > col - 1) newW = col - gridX //右边界
        if (w < 1) newW = 1;
        if (h < 1) newH = 1;
        return {
            w: newW, h: newH
        }
    }

    // grid位置转化为px位置
    const calGridToPx = (gridX: number, gridY: number) => {
        let x = Math.round(gridX * calColWidth() + (gridX + 1) * margin[0])
        let y = Math.round(gridY * rowHeight + margin[1] * (gridY + 1))

        return {
            x: x,
            y: y
        }
    }

    // px转化为grid位置
    const calPxToGrid = (x: number, y: number) => {
        // 坐标转换成格子的时候，无须计算margin
        let gridX = Math.round(x / containerWidth * col)
        let gridY = Math.round(y / (rowHeight + (margin ? margin[1] : 0)))

        // 防止元素出container
        return checkGrid(gridX, gridY, col, gridW)
    }

    // 包裹元素的className
    const cls = classNames((children.props.className || ''), className);

    const { w, h } = calWHtoPx(gridW, gridH);
    const { x, y } = calGridToPx(gridX, gridY);

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
                width={w}
                height={h}
            >
                {
                    React.cloneElement(React.Children.only(children), {
                        className: cls,
                        style: {
                            ...children.props.style,
                            ...style,
                            position: 'absolute',
                            transition: dragType && dragType != 'none' && (canDrag() || canResize()) ? '' : 'all .2s ease-out',
                            zIndex: dragType && dragType != 'none' && (canDrag() || canResize()) ? (dragType === 'drag' ? 10 : 2) : 2
                        }
                    })
                }
            </ResizeZoom>
        </Draggable>
    );
});

export { DraggerItem, GridItem };