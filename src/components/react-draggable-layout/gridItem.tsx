// import * as React from "react";
import { Dragger } from './dragger/index'
// import { checkInContainer } from './util/correction';
// import { Bound } from './utils';

// export interface GridItemProps {
//     /**外部容器属性 */
//     col: number,
//     containerWidth: number,
//     containerPadding: [number, number],

//     /**子元素的属性 */
//     margin?: [number, number],
//     GridX: number,
//     GridY: number,
//     rowHeight: number,

//     /**子元素的宽高 */
//     w: number,
//     h: number,

//     /**生命周期回掉函数 */
//     onDragStart?: (event: GridItemEvent) => void,
//     onDragEnd?: (event: GridItemEvent) => void,
//     onDrag?: (event: GridItemEvent) => void

//     onResizeStart?: (event: GridItemEvent) => void
//     onResizing?: (event: GridItemEvent) => void
//     onResizeEnd?: (event: GridItemEvent) => void

//     isUserMove: Boolean

//     UniqueKey?: string

//     static?: Boolean

//     style?: React.CSSProperties

//     bounds?: Bound | 'parent'

//     dragType: 'drag' | 'resize'

//     handle?: Boolean

//     children: (provided: any, draggerProps: any, resizerProps: any) => any;
// }

// export interface GridItemEvent {
//     event: any
//     GridX: number
//     GridY: number
//     w: number
//     h: number
//     UniqueKey: string | number
// }


// const checkWidthHeight = (GridX: number, w: number, h: number, col: number) => {
//     var newW = w;
//     var newH = h;
//     if (GridX + w > col - 1) newW = col - GridX //右边界
//     if (w < 1) newW = 1;
//     if (h < 1) newH = 1;
//     return {
//         w: newW, h: newH
//     }

// }

// export default class GridItems extends React.Component<GridItemProps, {}> {
//     constructor(props: GridItemProps) {
//         super(props)
//         this.onDrag = this.onDrag.bind(this)
//         this.onDragStart = this.onDragStart.bind(this)
//         this.onDragEnd = this.onDragEnd.bind(this)
//         this.calGridXY = this.calGridXY.bind(this)
//         this.calColWidth = this.calColWidth.bind(this)
//     }


//     static defaultProps = {
//         col: 12,
//         containerWidth: 500,
//         containerPadding: [0, 0],
//         margin: [10, 10],
//         rowHeight: 30,
//         w: 1,
//         h: 1
//     }

//     /** 计算容器的每一个格子多大 */
//     calColWidth() {
//         const { containerWidth, col, containerPadding, margin } = this.props;

//         if (margin) {
//             return (containerWidth - containerPadding[0] * 2 - margin[0] * (col + 1)) / col
//         }
//         return (containerWidth - containerPadding[0] * 2 - 0 * (col + 1)) / col
//     }

//     /**转化，计算网格的GridX,GridY值 */
//     calGridXY(x: number, y: number) {
//         const { margin, containerWidth, col, w, rowHeight } = this.props

//         /**坐标转换成格子的时候，无须计算margin */
//         let GridX = Math.round(x / containerWidth * col)
//         let GridY = Math.round(y / (rowHeight + (margin ? margin[1] : 0)))

//         // /**防止元素出container */
//         return checkInContainer(GridX, GridY, col, w)
//     }


//     /**给予一个grid的位置，算出元素具体的在容器中位置在哪里，单位是px */
//     calGridToPx(GridX: number, GridY: number) {
//         var { margin, rowHeight } = this.props

//         if (!margin) margin = [0, 0];

//         let x = Math.round(GridX * this.calColWidth() + (GridX + 1) * margin[0])
//         let y = Math.round(GridY * rowHeight + margin[1] * (GridY + 1))


//         return {
//             x: x,
//             y: y
//         }
//     }


//     shouldComponentUpdate(props: GridItemProps, state: any) {

//         let isUpdate = false
//         Object.keys(props).forEach((key) => {
//             if ((props as any)[key] !== (this.props as any)[key]) {
//                 isUpdate = true
//             }
//         })
//         return isUpdate
//     }

//     /**宽和高计算成为px */
//     calWHtoPx(w: number, h: number) {
//         var { margin } = this.props

//         if (!margin) margin = [0, 0];
//         const wPx = Math.round(w * this.calColWidth() + (w - 1) * margin[0])
//         const hPx = Math.round(h * this.props.rowHeight + (h - 1) * margin[1])

//         return { wPx, hPx }
//     }

//     calPxToWH(wPx: number, hPx: number) {
//         const calWidth = this.calColWidth();

//         const w = Math.round((wPx - calWidth * 0.5) / calWidth)
//         const h = Math.round((hPx - this.props.rowHeight * 0.5) / this.props.rowHeight)
//         return checkWidthHeight(this.props.GridX, w, h, this.props.col)
//     }

//     onDragStart(x: number, y: number) {
//         const { w, h, UniqueKey } = this.props;

//         if (this.props.static) return;

//         const { GridX, GridY } = this.calGridXY(x, y)

//         this.props.onDragStart && this.props.onDragStart(event, { GridX, GridY, w, h, UniqueKey: UniqueKey + ''})
//     }
//     onDrag(event: any, x: number, y: number) {
//         if (this.props.static) return;
//         const { GridX, GridY } = this.calGridXY(x, y)
//         const { w, h, UniqueKey } = this.props
//         this.props.onDrag && this.props.onDrag(event, { GridX, GridY, w, h, UniqueKey: UniqueKey + '' })
//     }

//     onDragEnd(event: any, x: number, y: number) {
//         if (this.props.static) return;
//         const { GridX, GridY } = this.calGridXY(x, y);
//         const { w, h, UniqueKey } = this.props;
//         if (this.props.onDragEnd) this.props.onDragEnd(event, { GridX, GridY, w, h, UniqueKey: UniqueKey + '' });
//     }

//     onResizeStart = (event: any, wPx: number, hPx: number) => {
//         const { GridX, GridY, UniqueKey, w, h } = this.props;
//         this.props.onResizeStart && this.props.onResizeStart(event, { GridX, GridY, w, h, UniqueKey: UniqueKey + '' })
//     }

//     onResizing = (event: any, wPx: number, hPx: number) => {
//         var { w, h } = this.calPxToWH(wPx, hPx);

//         const { GridX, GridY, UniqueKey } = this.props;
//         this.props.onResizing && this.props.onResizing(event, { GridX, GridY, w, h, UniqueKey: UniqueKey + '' })
//     }

//     onResizeEnd = (event: any, wPx: number, hPx: number) => {
//         var { w, h } = this.calPxToWH(wPx, hPx);
//         const { GridX, GridY, UniqueKey } = this.props;

//         this.props.onResizeEnd && this.props.onResizeEnd(event, { GridX, GridY, w, h, UniqueKey: UniqueKey + '' })
//     }
//     render() {
//         const { w, h, style, bounds, GridX, GridY, handle } = this.props;
//         const { x, y } = this.calGridToPx(GridX, GridY);
//         const { wPx, hPx } = this.calWHtoPx(w, h);
//         return (
//             <Dragger
//                 style={{
//                     ...style,
//                     position: 'absolute',
//                     transition: this.props.isUserMove ? '' : 'all .2s ease-out',
//                     zIndex: this.props.isUserMove ? (this.props.dragType === 'drag' ? 10 : 2) : 2
//                 }}
//                 onDragStart={this.onDragStart}
//                 onMove={this.onDrag}
//                 onDragEnd={this.onDragEnd}
//                 onResizeStart={this.onResizeStart}
//                 onResizing={this.onResizing}
//                 onResizeEnd={this.onResizeEnd}
//                 x={x}
//                 y={y}
//                 w={wPx}
//                 h={hPx}
//                 isUserMove={this.props.isUserMove}
//                 bounds={bounds}
//             >
//                 {/* {(provided, draggerProps, resizerProps) => this.props.children(provided, draggerProps, resizerProps)} */}
//                 {this.props.children}
//             </Dragger>
//         )
//     }
// }

import React, { useEffect, useRef, useState, CSSProperties, useImperativeHandle } from 'react';
import ResizeZoom from "@/components/react-resize-zoom";
import { EventType as ResizeEventType, EventHandler as ResizeEventHandler } from "@/components/react-resize-zoom/type";
import Draggable, { EventType as DragEventType, DragHandler as DragEventHandler, BoundsInterface } from "@/components/react-free-draggable";
import { ChildrenType } from "./utils/types";
import { checkInContainer } from './util/correction';
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
    bounds?: BoundsInterface;
    boundsParent?: string | HTMLElement;
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
        boundsParent,
        dragType,
        forbid
    } = props;


    // const onDragStart: DragEventHandler = (x: number, y: number,) => {

    //     if (forbid) return;
    //     const { GridX, GridY } = calPxToGrid(x, y)
    //     props.onDragStart && props.onDragStart(null, { GridX, GridY, w, h, UniqueKey: UniqueKey + '' })
    // }

    // const onDrag: DragEventHandler = (e: any, x: number, y: number) => {
    //     if (forbid) return;
    //     const { GridX, GridY } = calPxToGrid(x, y);
    //     props.onDrag && props.onDrag(e, { GridX, GridY, w, h, UniqueKey: UniqueKey + '' })
    // }

    // const onDragStop: DragEventHandler = (e: any, x: number, y: number) => {
    //     if (forbid) return;
    //     const { GridX, GridY } = calPxToGrid(x, y);
    //     props.onDragEnd && props.onDragEnd(e, { GridX, GridY, w, h, UniqueKey: UniqueKey + '' });
    // }

    // const onResizeStart: ResizeEventHandler = (e: any, wPx: number, hPx: number) => {

    //     props.onResizeStart && props.onResizeStart(e, { GridX, GridY, w, h, UniqueKey: UniqueKey + '' })
    // }

    // const onResizing: ResizeEventHandler = (e: any, wPx: number, hPx: number) => {
    //     const { w, h } = calPxToWH(wPx, hPx);
    //     props.onResizing && props.onResizing(e, { GridX, GridY, w, h, UniqueKey: UniqueKey + '' })
    // }

    // const onResizeEnd: ResizeEventHandler = (e: any, wPx: number, hPx: number) => {
    //     const { w, h } = calPxToWH(wPx, hPx);
    //     props.onResizeEnd && props.onResizeEnd(e, { GridX, GridY, w, h, UniqueKey: UniqueKey + '' })
    // }
    

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
            // axis={dragType === 'drag' ? "both" : "none"}
            onDragStart={onDragStart}
            onDrag={onDrag}
            onDragStop={onDragStop}
            x={x}
            y={y}
            bounds={bounds}
        >
            <ResizeZoom
                // axis={dragType === 'resize' ? "auto" : "none"}
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
                            zIndex: isUserMove ? (dragType === 'drag' ? 10 : 2) : 2
                        }
                    })
                }
            </ResizeZoom>
        </Draggable>
    )

    // return (
    //     <Dragger
    //         style={{
    //             ...style,
    //             position: 'absolute',
    //             transition: isUserMove ? '' : 'all .2s ease-out',
    //             zIndex: isUserMove ? (dragType === 'drag' ? 10 : 2) : 2
    //         }}
    //         onDragStart={onDragStart}
    //         onMove={onDrag}
    //         onDragEnd={onDragStop}
    //         onResizeStart={onResizeStart}
    //         onResizing={onResizing}
    //         onResizeEnd={onResizeEnd}
    //         x={x}
    //         y={y}
    //         w={wPx}
    //         h={hPx}
    //         isUserMove={isUserMove}
    //         bounds={bounds}
    //     >
    //         {children}
    //     </Dragger>
    // )
});

export default GridItem;