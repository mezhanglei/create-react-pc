import React from "react";
import { checkInContainer, checkWidthHeight } from './utils/dom';
import ResizeZoom, { EventHandler as ResizeEventHandler, DirectionCode } from "@/components/react-resize-zoom";
import Draggable, { DragHandler as DragEventHandler, DragAxisCode } from "@/components/react-free-draggable";
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
        cols: 12,
        containerWidth: 500,
        containerPadding: [0, 0],
        margin: [10, 10],
        rowHeight: 30,
        w: 1,
        h: 1,
        dragAxis: DragAxisCode,
        resizeAxis: DirectionCode
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
    calcolsWidth = () => {
        const { containerWidth, cols, containerPadding, margin } = this.props;
        if (margin) {
            return (containerWidth - containerPadding[0] * 2 - margin[0] * (cols + 1)) / cols
        }
        return (containerWidth - containerPadding[0] * 2 - 0 * (cols + 1)) / cols
    }

    // 布局位置计算为px单位
    calGridXYToPx = (GridX: number, GridY: number) => {
        let { margin, rowHeight } = this.props
        if (!margin) margin = [0, 0];
        const x = Math.round(GridX * this.calcolsWidth() + (GridX + 1) * margin[0])
        const y = Math.round(GridY * rowHeight + margin[1] * (GridY + 1))
        return { x, y };
    }

    // px 转化为布局位置
    calPxToGridXY = (x: number, y: number) => {
        const { margin, containerWidth, cols, w, rowHeight } = this.props
        // 坐标计算为格子时无需计算margin
        let GridX = Math.round(x / containerWidth * cols)
        let GridY = Math.round(y / (rowHeight + (margin ? margin[1] : 0)))
        return checkInContainer(GridX, GridY, cols, w)
    }

    // 布局宽高转化为px单位
    calWHtoPx = (w: number, h: number) => {
        let { margin, rowHeight } = this.props

        if (!margin) margin = [0, 0];
        const wPx = Math.round(w * this.calcolsWidth() + (w - 1) * margin[0])
        const hPx = Math.round(h * rowHeight + (h - 1) * margin[1])

        return { wPx, hPx }
    }

    // px转化为布局宽高单位
    calPxToWH = (wPx: number, hPx: number) => {
        const { rowHeight, cols, GridX } = this.props;
        const calWidth = this.calcolsWidth();
        const w = Math.round((wPx - calWidth * 0.5) / calWidth);
        const h = Math.round((hPx - rowHeight * 0.5) / rowHeight);
        return checkWidthHeight(GridX, w, h, cols);
    }

    addEventParams = (data: object) => {
        const { GridX, GridY, w, h, uniqueKey, margin, isMove, forbid, handle, dragAxis, resizeAxis, zIndexRange } = this.props;
        return { GridX, GridY, w, h, uniqueKey, margin, isMove, forbid, handle, dragAxis, resizeAxis, zIndexRange, ...data };
    }

    onDragStart: DragEventHandler = (e, data) => {
        this.setState({
            dragType: DragTypes.dragStart
        });
        if (!data || !this.canDrag()) return;
        const { x = 0, y = 0 } = data;
        const { GridX, GridY } = this.calPxToGridXY(x, y)
        this.props.onDragStart && this.props.onDragStart(this.addEventParams({ GridX, GridY }), e)
    }
    onDrag: DragEventHandler = (e, data) => {
        this.setState({
            dragType: DragTypes.draging
        });
        if (!data || !this.canDrag()) return;
        const { x = 0, y = 0 } = data;
        const { GridX, GridY } = this.calPxToGridXY(x, y);
        this.props.onDrag && this.props.onDrag(this.addEventParams({ GridX, GridY }), e)
    }

    onDragEnd: DragEventHandler = (e, data) => {
        this.setState({
            dragType: DragTypes.dragEnd
        })
        if (!data || !this.canDrag()) return;
        const { x = 0, y = 0 } = data;
        const { GridX, GridY } = this.calPxToGridXY(x, y);
        if (this.props.onDragEnd) this.props.onDragEnd(this.addEventParams({ GridX, GridY }), e);
    }

    onResizeStart: ResizeEventHandler = (e) => {
        this.setState({
            dragType: DragTypes.resizeStart
        })
        this.props.onResizeStart && this.props.onResizeStart(this.addEventParams({}), e)
    }

    onResizing: ResizeEventHandler = (e, data) => {
        this.setState({
            dragType: DragTypes.resizing
        })
        if (!data || !this.canResize()) return;
        const { width, height } = data;
        const { w, h } = this.calPxToWH(width, height);
        this.props.onResizing && this.props.onResizing(this.addEventParams({ w, h }), e)
    }

    onResizeEnd: ResizeEventHandler = (e, data) => {
        this.setState({
            dragType: DragTypes.resizeEnd
        })
        if (!data || !this.canResize()) return;
        const { width, height } = data;
        const { w, h } = this.calPxToWH(width, height);
        this.props.onResizeEnd && this.props.onResizeEnd(this.addEventParams({ w, h }), e)
    }

    // 可以拖拽
    canDrag = () => {
        const { dragAxis, forbid } = this.props;
        const canUse = DragAxisCode?.some((axis) => dragAxis?.includes(axis))
        return !forbid && (!dragAxis || canUse)
    }

    // 可以调整尺寸
    canResize = () => {
        const { resizeAxis, forbid } = this.props;
        const canUse = DirectionCode?.some((dir) => resizeAxis?.includes(dir));
        return !forbid && (!resizeAxis || canUse)
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
                axis={this.canDrag() ? dragAxis : []}
                bounds={bounds}
                handle={handle}
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
                    axis={this.canResize() ? resizeAxis : []}
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