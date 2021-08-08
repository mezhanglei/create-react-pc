import React, { useState, useEffect } from "react";
import { checkInContainer, checkWidthHeight } from './util/dom';
import ResizeZoom from "@/components/react-resize-zoom";
import { EventType as ResizeEventType, EventHandler as ResizeEventHandler, ResizeAxis } from "@/components/react-resize-zoom/type";
import Draggable, { EventType as DragEventType, DragHandler as DragEventHandler, DragAxis } from "@/components/react-free-draggable";
import classNames from "classnames";
import { GridItemProps, DragTypes } from './grid-item-types';

export default class GridItem extends React.Component<GridItemProps, { dragType?: DragTypes }> {
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

    // shouldComponentUpdate(props: GridItemProps, state: any) {

    //     let isUpdate = false
    //     Object.keys(props).forEach((key) => {
    //         if ((props as any)[key] !== (this.props as any)[key]) {
    //             isUpdate = true
    //         }
    //     })
    //     return isUpdate
    // }

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
        this.setState({
            dragType: DragTypes.dragStart
        });
        if (!data || !this.canDrag()) return;
        const { w, h, UniqueKey } = this.props;
        const { x = 0, y = 0 } = data;
        const { GridX, GridY } = this.calPxToGridXY(x, y)
        this.props.onDragStart && this.props.onDragStart({ e, GridX, GridY, w, h, UniqueKey: UniqueKey + '' })
    }
    onDrag: DragEventHandler = (e, data) => {
        this.setState({
            dragType: DragTypes.draging
        });
        if (!data || !this.canDrag()) return;
        const { w, h, UniqueKey } = this.props;
        const { x = 0, y = 0 } = data;
        const { GridX, GridY } = this.calPxToGridXY(x, y);
        this.props.onDrag && this.props.onDrag({ GridX, GridY, w, h, UniqueKey: UniqueKey + '', e })
    }

    onDragEnd: DragEventHandler = (e, data) => {
        this.setState({
            dragType: DragTypes.dragEnd
        })
        if (!data || !this.canDrag()) return;
        const { w, h, UniqueKey } = this.props;
        const { x = 0, y = 0 } = data;
        const { GridX, GridY } = this.calPxToGridXY(x, y);
        if (this.props.onDragEnd) this.props.onDragEnd({ GridX, GridY, w, h, UniqueKey: UniqueKey + '', e });
    }

    onResizeStart: ResizeEventHandler = (e) => {
        this.setState({
            dragType: DragTypes.resizeStart
        })
        const { GridX, GridY, UniqueKey, w, h } = this.props;
        this.props.onResizeStart && this.props.onResizeStart({ GridX, GridY, w, h, UniqueKey: UniqueKey + '', e })
    }

    onResizing: ResizeEventHandler = (e, data) => {
        this.setState({
            dragType: DragTypes.resizing
        })
        if (!data || !this.canResize()) return;
        const { GridX, GridY, UniqueKey } = this.props;
        const { width, height } = data;
        const { w, h } = this.calPxToWH(width, height);
        this.props.onResizing && this.props.onResizing({ GridX, GridY, w, h, UniqueKey: UniqueKey + '', e })
    }

    onResizeEnd: ResizeEventHandler = (e, data) => {
        this.setState({
            dragType: DragTypes.resizeEnd
        })
        if (!data || !this.canResize()) return;
        const { GridX, GridY, UniqueKey } = this.props;
        const { width, height } = data;
        const { w, h } = this.calPxToWH(width, height);

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
        const dragType = this.state.dragType;
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
                                transition: isMove || !parentDragType || !this.canDrag() ? '' : 'all .2s ease-out',
                                zIndex: dragType && ([DragTypes.dragStart, DragTypes.draging] as string[])?.includes(dragType) ? zIndexRange?.[1] : zIndexRange?.[0]
                            }
                        })
                    }
                </ResizeZoom>
            </Draggable>
        )
    }
}

// const GridItem = React.forwardRef<{}, GridItemProps>((props, ref) => {

//     let {
//         col = 12,
//         containerWidth = 500,
//         containerPadding = [0, 0],
//         rowHeight = 30,
//         margin = [10, 10],
//         GridX,
//         GridY,
//         w = 1,
//         h = 1,
//         UniqueKey,
//         parentDragType,
//         isMove,
//         forbid,
//         bounds,
//         handle,
//         dragAxis = DragAxis.both,
//         resizeAxis = ResizeAxis.AUTO,
//         zIndexRange,
//         children,
//         className,
//         style
//     } = props;

//     const [dragType, setDragType] = useState<`${DragTypes}`>();

//     useEffect(() => {
//         console.log(dragType)
//     }, [dragType])

//     // 计算每列的宽度
//     const calColWidth = () => {
//         if (margin) {
//             return (containerWidth - containerPadding[0] * 2 - margin[0] * (col + 1)) / col
//         }
//         return (containerWidth - containerPadding[0] * 2 - 0 * (col + 1)) / col
//     }

//     // 布局位置计算为px单位
//     const calGridXYToPx = (GridX: number, GridY: number) => {
//         if (!margin) margin = [0, 0];
//         const x = Math.round(GridX * calColWidth() + (GridX + 1) * margin[0])
//         const y = Math.round(GridY * rowHeight + margin[1] * (GridY + 1))
//         return { x, y };
//     }

//     // px 转化为布局位置
//     const calPxToGridXY = (x: number, y: number) => {
//         // 坐标计算为格子时无需计算margin
//         let GridX = Math.round(x / containerWidth * col)
//         let GridY = Math.round(y / (rowHeight + (margin ? margin[1] : 0)))
//         return checkInContainer(GridX, GridY, col, w)
//     }

//     // 布局宽高转化为px单位
//     const calWHtoPx = (w: number, h: number) => {
//         if (!margin) margin = [0, 0];
//         const wPx = Math.round(w * calColWidth() + (w - 1) * margin[0])
//         const hPx = Math.round(h * rowHeight + (h - 1) * margin[1])
//         return { wPx, hPx }
//     }

//     // px转化为布局宽高单位
//     const calPxToWH = (wPx: number, hPx: number) => {
//         const calWidth = calColWidth();
//         const w = Math.round((wPx - calWidth * 0.5) / calWidth);
//         const h = Math.round((hPx - rowHeight * 0.5) / rowHeight);
//         return checkWidthHeight(GridX, w, h, col);
//     }

//     const onDragStart: DragEventHandler = (e, data) => {
//         if (!data || !canDrag()) return;
//         const { x = 0, y = 0 } = data;
//         const { GridX, GridY } = calPxToGridXY(x, y)
//         setDragType(DragTypes.dragStart);
//         props.onDragStart && props.onDragStart({ e, GridX, GridY, w, h, UniqueKey: UniqueKey + '' })
//     }
//     const onDrag: DragEventHandler = (e, data) => {
//         if (!data || !canDrag()) return;
//         const { x = 0, y = 0 } = data;
//         const { GridX, GridY } = calPxToGridXY(x, y);
//         setDragType(DragTypes.draging)
//         props.onDrag && props.onDrag({ GridX, GridY, w, h, UniqueKey: UniqueKey + '', e })
//     }

//     const onDragEnd: DragEventHandler = (e, data) => {
//         if (!data || !canDrag()) return;
//         const { x = 0, y = 0 } = data;
//         const { GridX, GridY } = calPxToGridXY(x, y);
//         setDragType(DragTypes.dragEnd);
//         props.onDragEnd && props.onDragEnd({ GridX, GridY, w, h, UniqueKey: UniqueKey + '', e });
//     }

//     const onResizeStart: ResizeEventHandler = (e) => {
//         setDragType(DragTypes.resizeStart);
//         props.onResizeStart && props.onResizeStart({ GridX, GridY, w, h, UniqueKey: UniqueKey + '', e })
//     }

//     const onResizing: ResizeEventHandler = (e, data) => {
//         if (!data || !canResize()) return;
//         const { width, height } = data;
//         const { w, h } = calPxToWH(width, height);
//         setDragType(DragTypes.resizing);
//         props.onResizing && props.onResizing({ GridX, GridY, w, h, UniqueKey: UniqueKey + '', e })
//     }

//     const onResizeEnd: ResizeEventHandler = (e, data) => {
//         if (!data || !canResize()) return;
//         const { width, height } = data;
//         const { w, h } = calPxToWH(width, height);
//         setDragType(DragTypes.resizeEnd);
//         props.onResizeEnd && props.onResizeEnd({ GridX, GridY, w, h, UniqueKey: UniqueKey + '', e })
//     }

//     // 可以拖拽
//     const canDrag = () => {
//         return !forbid && (!dragAxis || !([DragAxis.none] as string[])?.includes(dragAxis))
//     }

//     // 可以调整尺寸
//     const canResize = () => {
//         return !forbid && (!resizeAxis || !([ResizeAxis.NONE] as string[])?.includes(resizeAxis))
//     }

//     const { x, y } = calGridXYToPx(GridX, GridY);
//     const { wPx, hPx } = calWHtoPx(w, h);
//     const cls = classNames((children?.props?.className || ''), className);

//     return (
//         <Draggable
//             className={cls}
//             axis={dragAxis}
//             bounds={bounds}
//             dragNode={handle}
//             onDragStart={onDragStart}
//             onDrag={onDrag}
//             onDragStop={onDragEnd}
//             x={x}
//             y={y}
//         >
//             <ResizeZoom
//                 onResizeStart={onResizeStart}
//                 onResizeMoving={onResizing}
//                 onResizeEnd={onResizeEnd}
//                 axis={resizeAxis}
//                 width={wPx}
//                 height={hPx}
//             >
//                 {
//                     React.cloneElement(React.Children.only(children), {
//                         style: {
//                             ...children.props.style,
//                             ...style,
//                             position: 'absolute',
//                             transition: isMove || !parentDragType ? '' : 'all .2s ease-out',
//                             zIndex: isMove ? ((parentDragType && [DragTypes.dragStart, DragTypes.draging] as string[])?.includes(parentDragType) ? zIndexRange?.[1] : zIndexRange?.[0]) : zIndexRange?.[0]
//                         }
//                     })
//                 }
//             </ResizeZoom>
//         </Draggable>
//     )
// });
// export default GridItem;