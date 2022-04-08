import React from "react";
import { checkInContainer, checkWidthHeight } from './utils/dom';
import ResizeZoom, { EventHandler as ResizeEventHandler, ResizeDirectionCode } from "@/components/react-resize-zoom";
import Draggable, { DragHandler as DragEventHandler, DragDirectionCode } from "@/components/react-free-draggable";
import classNames from "classnames";
import { GridItemProps, DragTypes } from './grid-item-types';

export default class GridItem extends React.Component<GridItemProps, { dragType?: DragTypes }> {
  lastZindex: any;
  constructor(props: GridItemProps) {
    super(props)
    this.lastZindex = '';
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
    direction: [...DragDirectionCode, ...ResizeDirectionCode]
  }

  // 计算每列的宽度
  calcolsWidth = () => {
    const { containerWidth, cols, containerPadding, margin } = this.props;
    if (margin) {
      return (containerWidth - containerPadding[0] * 2 - margin[0] * (cols + 1)) / cols
    }
    return (containerWidth - containerPadding[0] * 2 - 0 * (cols + 1)) / cols
  }

  // 布局位置计算为px单位
  calGridXYToPx = (GridX?: number, GridY?: number) => {
    let { margin, rowHeight } = this.props
    if (!margin) margin = [0, 0];
    let x;
    let y;
    if (typeof GridX === 'number') {
      x = Math.round(GridX * this.calcolsWidth() + (GridX + 1) * margin[0])
    }
    if (typeof GridY === 'number') {
      y = Math.round(GridY * rowHeight + margin[1] * (GridY + 1))
    }
    return { x, y };
  }

  // px 转化为布局位置
  calPxToGridXY = (x: number, y: number) => {
    const { margin, containerWidth, cols, w, rowHeight } = this.props
    // 坐标计算为格子时无需计算margin
    let GridX = Math.round(x / containerWidth * cols)
    let GridY = Math.round(y / (rowHeight + (margin ? margin[1] : 0)))
    return checkInContainer(cols, GridX, GridY, w)
  }

  // 布局宽高转化为px单位
  calWHtoPx = (w?: number, h?: number) => {
    let { margin, rowHeight } = this.props
    if (!margin) margin = [0, 0];
    let wPx;
    let hPx;
    if (typeof w === 'number') {
      wPx = Math.round(w * this.calcolsWidth() + (w - 1) * margin[0])
    }
    if (typeof h === 'number') {
      hPx = Math.round(h * rowHeight + (h - 1) * margin[1])
    }
    return { wPx, hPx };
  }

  // px转化为布局宽高单位
  calPxToWH = (wPx: number, hPx: number) => {
    const { rowHeight, cols, GridX } = this.props;
    const calWidth = this.calcolsWidth();
    const w = Math.round((wPx - calWidth * 0.5) / calWidth);
    const h = Math.round((hPx - rowHeight * 0.5) / rowHeight);
    return checkWidthHeight(cols, GridX, w, h);
  }

  addEventParams = (data: object) => {
    const { GridX, GridY, w, h, uniqueKey, margin, forbid, handle, direction } = this.props;
    return { GridX, GridY, w, h, uniqueKey, margin, forbid, handle, direction, ...data };
  }

  onStart: DragEventHandler = (e, data) => {
    this.setState({
      dragType: DragTypes.Start
    });
    if (!data || !this.canDrag()) return;
    this.lastZindex = data?.node?.style?.zIndex;
    if (data?.node?.style?.zIndex != '999') {
      data.node.style.zIndex = '999'
    }
    const { x = 0, y = 0 } = data;
    const { GridX, GridY } = this.calPxToGridXY(x, y)
    this.props.onStart && this.props.onStart(this.addEventParams({ GridX, GridY }), e)
  }

  onMove: DragEventHandler = (e, data) => {
    this.setState({
      dragType: DragTypes.Move
    });
    if (!data || !this.canDrag()) return;
    if (data?.node?.style?.zIndex != '999') {
      data.node.style.zIndex = '999'
    }
    const { x = 0, y = 0 } = data;
    const { GridX, GridY } = this.calPxToGridXY(x, y);
    this.props.onMove && this.props.onMove(this.addEventParams({ GridX, GridY }), e)
  }

  onEnd: DragEventHandler = (e, data) => {
    this.setState({
      dragType: DragTypes.End
    })
    if (!data || !this.canDrag()) return;
    data.node.style.zIndex = this.lastZindex;
    const { x = 0, y = 0 } = data;
    const { GridX, GridY } = this.calPxToGridXY(x, y);
    if (this.props.onEnd) this.props.onEnd(this.addEventParams({ GridX, GridY }), e);
  }

  onResizeStart: ResizeEventHandler = (e, data) => {
    this.setState({
      dragType: DragTypes.ResizeStart
    })
    if (!data || !this.canResize()) return;
    this.lastZindex = data?.node?.style?.zIndex;
    if (data?.node?.style?.zIndex != '999') {
      data.node.style.zIndex = '999'
    }
    this.props.onResizeStart && this.props.onResizeStart(this.addEventParams({}), e)
  }

  onResizing: ResizeEventHandler = (e, data) => {
    this.setState({
      dragType: DragTypes.Resizing
    })
    if (!data || !this.canResize()) return;
    if (data?.node?.style?.zIndex != '999') {
      data.node.style.zIndex = '999'
    }
    const { width, height } = data;
    const { w, h } = this.calPxToWH(width, height);
    this.props.onResizing && this.props.onResizing(this.addEventParams({ w, h }), e)
  }

  onResizeEnd: ResizeEventHandler = (e, data) => {
    this.setState({
      dragType: DragTypes.ResizeEnd
    })
    if (!data || !this.canResize()) return;
    data.node.style.zIndex = this.lastZindex;
    const { width, height } = data;
    const { w, h } = this.calPxToWH(width, height);
    this.props.onResizeEnd && this.props.onResizeEnd(this.addEventParams({ w, h }), e)
  }

  // 可以拖拽
  canDrag = () => {
    const { direction, forbid } = this.props;
    const canUse = DragDirectionCode?.some((dir) => direction?.includes(dir))
    return !forbid && (!direction || canUse)
  }

  // 可以调整尺寸
  canResize = () => {
    const { direction, forbid } = this.props;
    const canUse = ResizeDirectionCode?.some((dir) => direction?.includes(dir));
    return !forbid && (!direction || canUse)
  }

  render() {
    const { w, h, style, bounds, GridX, GridY, handle, direction, children, className } = this.props;
    const dragType = this.state.dragType;
    const { x, y } = this.calGridXYToPx(GridX, GridY);
    const { wPx, hPx } = this.calWHtoPx(w, h);
    const cls = classNames((children?.props?.className || ''), className);
    const isDrag = (dragType && [DragTypes.Move, DragTypes.Resizing] as string[])?.includes(dragType);

    return (
      <Draggable
        className={cls}
        direction={this.canDrag() ? direction : []}
        bounds={bounds}
        handle={handle}
        onStart={this.onStart}
        onMove={this.onMove}
        onEnd={this.onEnd}
        x={x}
        y={y}
        style={{
          ...style,
          position: 'absolute',
          transition: isDrag || !this.canDrag() ? '' : 'all .2s ease-out'
        }}
      >
        <ResizeZoom
          onResizeStart={this.onResizeStart}
          onResizeMoving={this.onResizing}
          onResizeEnd={this.onResizeEnd}
          direction={this.canResize() ? direction : []}
          width={wPx}
          height={hPx}
        >
          {children}
        </ResizeZoom>
      </Draggable>
    )
  }
}