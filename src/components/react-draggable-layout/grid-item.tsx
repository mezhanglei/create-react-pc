import React, { useState } from "react";
import { checkInContainer, checkWidthHeight } from './util/correction';
import ResizeZoom from "@/components/react-resize-zoom";
import { EventType as ResizeEventType, EventHandler as ResizeEventHandler, ResizeAxis } from "@/components/react-resize-zoom/type";
import Draggable, { EventType as DragEventType, DragHandler as DragEventHandler, DragAxis, BoundsInterface } from "@/components/react-free-draggable";
import classNames from "classnames";

export type EventType = MouseEvent | TouchEvent;
// 拖拽类型
export enum DragTypes {
    dragStart = 'dragStart',
    draging = 'draging',
    dragEnd = 'dragEnd',
    resizeStart = 'resizeStart',
    resizing = 'resizing',
    resizeEnd = 'resizeEnd'
}
export interface GridItemEvent {
    e: EventType;
    GridX: number;
    GridY: number;
    w: number;
    h: number;
    UniqueKey: string | number;
}
export type GridItemEventHandle = (data: GridItemEvent) => void;
export interface GridItemProps {
    /**外部容器属性 */
    col: number,
    containerWidth: number,
    containerPadding: [number, number],
    rowHeight: number,

    /**子元素的属性 */
    margin?: [number, number],
    GridX: number,
    GridY: number,
    w: number,
    h: number,

    onDragStart?: GridItemEventHandle;
    onDragEnd?: GridItemEventHandle;
    onDrag?: GridItemEventHandle;
    onResizeStart?: GridItemEventHandle;
    onResizing?: GridItemEventHandle;
    onResizeEnd?: GridItemEventHandle;

    UniqueKey?: string | number;
    parentDragType?: `${DragTypes}`; // 父元素内发生的拖拽类型
    isMove?: boolean; // 是否移动
    forbid?: boolean; // 禁止拖拽和移动
    bounds?: string | HTMLElement | BoundsInterface; // 定位父元素
    handle?: string | HTMLElement; // 拖拽句柄
    dragAxis?: DragAxis; // 允许的拖拽类型
    resizeAxis?: ResizeAxis; // 允许缩放类型
    zIndexRange?: [number, number];
    children: any;
    className?: string;
    style?: React.CSSProperties;
}

export default class GridItem extends React.Component<GridItemProps, {}> {
    constructor(props: GridItemProps) {
        super(props)
        this.state = {
            dragType: undefined
        }
    }

    static defaultProps = {
        col: 12,
        containerWidth: 500,
        containerPadding: [0, 0],
        margin: [10, 10],
        rowHeight: 30,
        w: 1,
        h: 1,
        dragAxis: DragAxis.both,
        resizeAxis: ResizeAxis.AUTO
    }

    shouldComponentUpdate(props: GridItemProps, state: any) {

        let isUpdate = false
        Object.keys(props).forEach((key) => {
            if ((props as any)[key] !== (this.props as any)[key]) {
                isUpdate = true
            }
        })
        return isUpdate
    }

    // 计算每列的宽度
    calColWidth = () => {
        const { containerWidth, col, containerPadding, margin } = this.props;
        if (margin) {
            return (containerWidth - containerPadding[0] * 2 - margin[0] * (col + 1)) / col
        }
        return (containerWidth - containerPadding[0] * 2 - 0 * (col + 1)) / col
    }

    // 布局位置计算为px单位
    calGridXYToPx = (GridX: number, GridY: number) => {
        let { margin, rowHeight } = this.props
        if (!margin) margin = [0, 0];
        const x = Math.round(GridX * this.calColWidth() + (GridX + 1) * margin[0])
        const y = Math.round(GridY * rowHeight + margin[1] * (GridY + 1))
        return { x, y };
    }

    // px 转化为布局位置
    calPxToGridXY = (x: number, y: number) => {
        const { margin, containerWidth, col, w, rowHeight } = this.props
        // 坐标计算为格子时无需计算margin
        let GridX = Math.round(x / containerWidth * col)
        let GridY = Math.round(y / (rowHeight + (margin ? margin[1] : 0)))
        return checkInContainer(GridX, GridY, col, w)
    }

    // 布局宽高转化为px单位
    calWHtoPx = (w: number, h: number) => {
        let { margin, rowHeight } = this.props

        if (!margin) margin = [0, 0];
        const wPx = Math.round(w * this.calColWidth() + (w - 1) * margin[0])
        const hPx = Math.round(h * rowHeight + (h - 1) * margin[1])

        return { wPx, hPx }
    }

    // px转化为布局宽高单位
    calPxToWH = (wPx: number, hPx: number) => {
        const { rowHeight, col, GridX } = this.props;
        const calWidth = this.calColWidth();
        const w = Math.round((wPx - calWidth * 0.5) / calWidth);
        const h = Math.round((hPx - rowHeight * 0.5) / rowHeight);
        return checkWidthHeight(GridX, w, h, col);
    }

    onDragStart: DragEventHandler = (e, data) => {
        if (!data || !this.canDrag()) return;
        const { w, h, UniqueKey } = this.props;
        const { x = 0, y = 0 } = data;
        const { GridX, GridY } = this.calPxToGridXY(x, y)
        this.setState({
            dragType: DragTypes.dragStart
        })
        this.props.onDragStart && this.props.onDragStart({ e, GridX, GridY, w, h, UniqueKey: UniqueKey + '' })
    }
    onDrag: DragEventHandler = (e, data) => {
        if (!data || !this.canDrag()) return;
        const { w, h, UniqueKey } = this.props;
        const { x = 0, y = 0 } = data;
        const { GridX, GridY } = this.calPxToGridXY(x, y);
        this.setState({
            dragType: DragTypes.draging
        });
        this.props.onDrag && this.props.onDrag({ GridX, GridY, w, h, UniqueKey: UniqueKey + '', e })
    }

    onDragEnd: DragEventHandler = (e, data) => {
        if (!data || !this.canDrag()) return;
        const { x = 0, y = 0 } = data;
        const { GridX, GridY } = this.calPxToGridXY(x, y);
        const { w, h, UniqueKey } = this.props;
        this.setState({
            dragType: DragTypes.dragEnd
        })
        if (this.props.onDragEnd) this.props.onDragEnd({ GridX, GridY, w, h, UniqueKey: UniqueKey + '', e });
    }

    onResizeStart: ResizeEventHandler = (e) => {
        const { GridX, GridY, UniqueKey, w, h } = this.props;
        this.setState({
            dragType: DragTypes.resizeStart
        })
        this.props.onResizeStart && this.props.onResizeStart({ GridX, GridY, w, h, UniqueKey: UniqueKey + '', e })
    }

    onResizing: ResizeEventHandler = (e, data) => {
        if (!data || !this.canResize()) return;
        const { GridX, GridY, UniqueKey } = this.props;
        const { width, height } = data;
        const { w, h } = this.calPxToWH(width, height);
        this.setState({
            dragType: DragTypes.resizing
        })
        this.props.onResizing && this.props.onResizing({ GridX, GridY, w, h, UniqueKey: UniqueKey + '', e })
    }

    onResizeEnd: ResizeEventHandler = (e, data) => {
        if (!data || !this.canResize()) return;

        const { GridX, GridY, UniqueKey } = this.props;
        const { width, height } = data;
        const { w, h } = this.calPxToWH(width, height);
        this.setState({
            dragType: DragTypes.resizeEnd
        })
        this.props.onResizeEnd && this.props.onResizeEnd({ GridX, GridY, w, h, UniqueKey: UniqueKey + '', e })
    }

    // 可以拖拽
    canDrag = () => {
        const { dragAxis, forbid } = this.props;
        return !forbid && (!dragAxis || !([DragAxis.none] as string[])?.includes(dragAxis))
    }

    // 可以调整尺寸
    canResize = () => {
        const { resizeAxis, forbid } = this.props;
        return !forbid && (!resizeAxis || !([ResizeAxis.NONE] as string[])?.includes(resizeAxis))
    }

    render() {
        const { w, h, style, bounds, GridX, GridY, handle, dragAxis, resizeAxis, isMove, parentDragType, zIndexRange, children, className } = this.props;
        const { x, y } = this.calGridXYToPx(GridX, GridY);
        const { wPx, hPx } = this.calWHtoPx(w, h);
        const cls = classNames((children?.props?.className || ''), className);

        return (
            <Draggable
                className={cls}
                axis={dragAxis}
                bounds={bounds}
                dragNode={handle}
                onDragStart={this.onDragStart}
                onDrag={this.onDrag}
                onDragStop={this.onDragEnd}
                x={x}
                y={y}
            >
                <ResizeZoom
                    onResizeStart={this.onResizeStart}
                    onResizeMoving={this.onResizing}
                    onResizeEnd={this.onResizeEnd}
                    axis={resizeAxis}
                    width={wPx}
                    height={hPx}
                >
                    {
                        React.cloneElement(React.Children.only(children), {
                            style: {
                                ...children.props.style,
                                ...style,
                                position: 'absolute',
                                transition: isMove || !parentDragType ? '' : 'all .2s ease-out',
                                zIndex: isMove ? ((parentDragType && [DragTypes.dragStart, DragTypes.draging] as string[])?.includes(parentDragType) ? zIndexRange?.[1] : zIndexRange?.[0]) : zIndexRange?.[0]
                            }
                        })
                    }
                </ResizeZoom>
            </Draggable>
        )
    }
}