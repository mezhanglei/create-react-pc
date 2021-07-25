import * as React from "react";
import { checkInContainer } from './util/correction';
import ResizeZoom from "@/components/react-resize-zoom";
import { EventType as ResizeEventType, EventHandler as ResizeEventHandler, ResizeAxis } from "@/components/react-resize-zoom/type";
import Draggable, { EventType as DragEventType, DragHandler as DragEventHandler, DragAxis, BoundsInterface } from "@/components/react-free-draggable";
import classNames from "classnames";
import { DragTypes } from "../react-dragger-sort/utils/types";

export type GridItemEventHandle = (event: GridItemEvent) => void;
export interface GridItemProps {
    /**外部容器属性 */
    col: number,
    containerWidth: number,
    containerPadding: [number, number],

    /**子元素的属性 */
    margin?: [number, number],
    GridX: number,
    GridY: number,
    rowHeight: number,

    /**子元素的宽高 */
    w: number,
    h: number,

    /**生命周期回掉函数 */
    onDragStart?: GridItemEventHandle;
    onDragEnd?: GridItemEventHandle;
    onDrag?: GridItemEventHandle;

    onResizeStart?: GridItemEventHandle;
    onResizing?: GridItemEventHandle;
    onResizeEnd?: GridItemEventHandle;

    UniqueKey?: string | number;
    parentDragType?: `${DragTypes}`; // 父元素内发生的拖拽类型
    isMove?: Boolean;
    static?: Boolean
    bounds?: string | HTMLElement | BoundsInterface;
    handle?: Boolean
    canDrag?: Boolean
    canResize?: Boolean
    children: any;
    className?: string;
    style?: React.CSSProperties;
    zIndexRange?: [number, number];
}

export interface GridItemEvent {
    event: any
    GridX: number
    GridY: number
    w: number
    h: number
    UniqueKey: string | number
}


const checkWidthHeight = (GridX: number, w: number, h: number, col: number) => {
    var newW = w;
    var newH = h;
    if (GridX + w > col - 1) newW = col - GridX //右边界
    if (w < 1) newW = 1;
    if (h < 1) newH = 1;
    return {
        w: newW, h: newH
    }

}

export default class GridItem extends React.Component<GridItemProps, {}> {
    constructor(props: GridItemProps) {
        super(props)
        this.onDrag = this.onDrag.bind(this)
        this.onDragStart = this.onDragStart.bind(this)
        this.onDragEnd = this.onDragEnd.bind(this)
        this.calGridXY = this.calGridXY.bind(this)
        this.calColWidth = this.calColWidth.bind(this)
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
        h: 1
    }

    /** 计算容器的每一个格子多大 */
    calColWidth() {
        const { containerWidth, col, containerPadding, margin } = this.props;

        if (margin) {
            return (containerWidth - containerPadding[0] * 2 - margin[0] * (col + 1)) / col
        }
        return (containerWidth - containerPadding[0] * 2 - 0 * (col + 1)) / col
    }

    /**转化，计算网格的GridX,GridY值 */
    calGridXY(x: number, y: number) {
        const { margin, containerWidth, col, w, rowHeight } = this.props

        /**坐标转换成格子的时候，无须计算margin */
        let GridX = Math.round(x / containerWidth * col)
        let GridY = Math.round(y / (rowHeight + (margin ? margin[1] : 0)))

        // /**防止元素出container */
        return checkInContainer(GridX, GridY, col, w)
    }


    /**给予一个grid的位置，算出元素具体的在容器中位置在哪里，单位是px */
    calGridItemPosition(GridX: number, GridY: number) {
        var { margin, rowHeight } = this.props

        if (!margin) margin = [0, 0];

        let x = Math.round(GridX * this.calColWidth() + (GridX + 1) * margin[0])
        let y = Math.round(GridY * rowHeight + margin[1] * (GridY + 1))


        return {
            x: x,
            y: y
        }
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

    /**宽和高计算成为px */
    calWHtoPx(w: number, h: number) {
        var { margin } = this.props

        if (!margin) margin = [0, 0];
        const wPx = Math.round(w * this.calColWidth() + (w - 1) * margin[0])
        const hPx = Math.round(h * this.props.rowHeight + (h - 1) * margin[1])

        return { wPx, hPx }
    }

    calPxToWH(wPx: number, hPx: number) {
        const calWidth = this.calColWidth();

        const w = Math.round((wPx - calWidth * 0.5) / calWidth)
        const h = Math.round((hPx - this.props.rowHeight * 0.5) / this.props.rowHeight)
        return checkWidthHeight(this.props.GridX, w, h, this.props.col)
    }

    onDragStart: DragEventHandler = (event, data) => {
        if (!data) return;
        const { w, h, UniqueKey } = this.props;
        const { x = 0, y = 0 } = data;

        if (this.props.static) return;

        const { GridX, GridY } = this.calGridXY(x, y)
        this.setState({
            dragType: DragTypes.dragStart
        })
        this.props.onDragStart && this.props.onDragStart({
            event, GridX, GridY, w, h, UniqueKey: UniqueKey + ''
        })
    }
    onDrag: DragEventHandler = (event, data) => {
        if (!data) return;
        if (this.props.static) return;
        const { x = 0, y = 0 } = data;
        const { GridX, GridY } = this.calGridXY(x, y)
        this.setState({
            dragType: DragTypes.draging
        })
        const { w, h, UniqueKey } = this.props
        this.props.onDrag && this.props.onDrag({ GridX, GridY, w, h, UniqueKey: UniqueKey + '', event })
    }

    onDragEnd: DragEventHandler = (event, data) => {
        if (!data) return;
        if (this.props.static) return;
        const { x = 0, y = 0 } = data;
        const { GridX, GridY } = this.calGridXY(x, y);
        const { w, h, UniqueKey } = this.props;
        this.setState({
            dragType: DragTypes.dragEnd
        })
        if (this.props.onDragEnd) this.props.onDragEnd({ GridX, GridY, w, h, UniqueKey: UniqueKey + '', event });
    }

    onResizeStart: ResizeEventHandler = (event) => {
        const { GridX, GridY, UniqueKey, w, h } = this.props;
        this.setState({
            dragType: DragTypes.resizeStart
        })
        this.props.onResizeStart && this.props.onResizeStart({ GridX, GridY, w, h, UniqueKey: UniqueKey + '', event })
    }

    onResizing: ResizeEventHandler = (event, data) => {
        if (!data) return;
        const wPx = data?.width;
        const hPx = data?.height;
        const { w, h } = this.calPxToWH(wPx, hPx);
        const { GridX, GridY, UniqueKey } = this.props;
        this.setState({
            dragType: DragTypes.resizing
        })
        this.props.onResizing && this.props.onResizing({ GridX, GridY, w, h, UniqueKey: UniqueKey + '', event })
    }

    onResizeEnd: ResizeEventHandler = (event: any, data) => {
        if (!data) return;
        const wPx = data?.width;
        const hPx = data?.height;
        const { w, h } = this.calPxToWH(wPx, hPx);
        const { GridX, GridY, UniqueKey } = this.props;
        this.setState({
            dragType: DragTypes.resizeEnd
        })
        this.props.onResizeEnd && this.props.onResizeEnd({ GridX, GridY, w, h, UniqueKey: UniqueKey + '', event })
    }
    render() {
        const { w, h, style, bounds, GridX, GridY, handle, canDrag, canResize } = this.props;
        const { x, y } = this.calGridItemPosition(GridX, GridY);
        const { wPx, hPx } = this.calWHtoPx(w, h);
        const children = this.props.children;
        const cls = classNames((children?.props?.className || ''), this.props.className);
        const dragType = this.state.dragType;
        const parentDragType = this.props.parentDragType;
        const zIndexRange = this.props.zIndexRange || [];

        return (
            <Draggable
                className={cls}
                axis="both"
                bounds={bounds}
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
                    axis='auto'
                    width={wPx}
                    height={hPx}
                >
                    {
                        React.cloneElement(React.Children.only(children), {
                            style: {
                                ...children.props.style,
                                ...style,
                                position: 'absolute',
                                transition: this.props.isMove || !parentDragType ? '' : 'all .2s ease-out',
                                zIndex: this.props.isMove ? ((parentDragType && [DragTypes.dragStart, DragTypes.draging] as string[])?.includes(parentDragType) ? zIndexRange[1] : zIndexRange[0]) : zIndexRange[0]
                            }
                        })
                    }
                </ResizeZoom>
            </Draggable>
        )
    }
}