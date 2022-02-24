import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import classNames from 'classnames';
import { createCSSTransform, createSVGTransform, getPositionByBounds } from './utils/dom';
import { DraggableProps, DragData, EventHandler, PositionType, DragAxisCode, DragAxis, BoundsInterface, EventData, DraggableState } from "./utils/types";
import { isElementSVG } from "@/utils/verify";
import DraggableEvent from './DraggableEvent';
import { findElement, getInsidePosition } from '@/utils/dom';
import { mergeObject } from '@/utils/object';
import ReactDOM from 'react-dom';

/**
 * 拖拽组件-回调处理(通过transform来控制元素拖拽, 不影响页面布局)
 */
const wrapClassName = "react-draggable";
const wrapClassNameDragging = "react-draggable-dragging";
const wrapClassNameDragged = "react-draggable-dragged";
class Draggable extends React.Component<DraggableProps, DraggableState> {
  dragging?: boolean;
  initXY?: PositionType;
  slackX: number;
  slackY: number;
  constructor(props: DraggableProps) {
    super(props);
    this.slackX = 0;
    this.slackY = 0;
    this.state = {
      dragData: {
        translateX: 0,
        translateY: 0,
        deltaX: 0,
        deltaY: 0
      },
      dragged: false,
      isSVG: false
    };
  }
  static defaultProps = {
    axis: DragAxisCode,
    scale: 1,
    zIndexRange: [],
  }

  componentDidUpdate(prevProps: DraggableProps, prevState: DraggableState) {
    const xChanged = this.props.x !== undefined && (this.props.x !== prevProps.x || this.props.x !== prevState.dragData?.x);
    const yChanged = this.props.y !== undefined && (this.props.y !== prevProps.y || this.props.y !== prevState.dragData?.y);
    if (xChanged || yChanged) {
      if (this.dragging === false) {
        const initX = this.initXY?.x as number;
        const initY = this.initXY?.y as number;
        // 初始化传值时根据限制重新计算该值
        const newX = this.props?.x as number;
        const newY = this.props?.y as number;
        const translateX = newX - initX;
        const translateY = newY - initY;
        this.setState({
          dragData: mergeObject(this.state.dragData, {
            x: newX,
            y: newY,
            lastX: newX,
            lastY: newY,
            translateX,
            translateY
          })
        });
        this.initXY = { x: newX, y: newY };
        console.log(2222, new Date().getTime())
      }
    }
  }

  static getDerivedStateFromProps(nextProps: DraggableProps, prevState: DraggableState) {
    const xChanged = nextProps.x !== prevState.prevX || nextProps.x !== prevState.dragData?.x;
    const yChanged = nextProps.y !== prevState.prevY || nextProps.y !== prevState.dragData?.y;
    if (xChanged) {
      return {
        ...prevState,
        prevX: nextProps.x,
      };
    }

    if (yChanged) {
      return {
        ...prevState,
        prevY: nextProps.y,
      };
    }
    return null;
  }

  componentDidMount() {
    const child = this.findDOMNode();
    const parent = this.getLocationParent();
    const pos = getInsidePosition(child, parent);
    const initXY = pos && {
      x: pos?.left,
      y: pos?.top
    };
    if (initXY) {
      this.setState({
        dragData: {
          ...this.state.dragData,
          x: initXY?.x,
          y: initXY?.y
        }
      });
      this.initXY = initXY;
    }
  }

  componentWillUnmount() {
  }

  findDOMNode() {
    return this.props?.forwardedRef?.current || ReactDOM.findDOMNode(this);
  }

  // 获取定位父元素，涉及的位置相对于该父元素
  getLocationParent = () => {
    const { bounds } = this.props;
    const parent = findElement(bounds) || findElement((bounds as BoundsInterface)?.boundsParent) || document.body || document.documentElement;
    return parent;
  }

  onDragStart: EventHandler = (e, data) => {
    e.stopImmediatePropagation();
    if (!data) return;
    const node = data?.node;
    const parent = this.getLocationParent();
    const pos = getInsidePosition(node, parent);
    let positionX = pos?.left;
    let positionY = pos?.top;
    const { dragData } = this.state;
    const { zIndexRange, onDragStart } = this.props;

    const translateX = dragData?.translateX || 0;
    const translateY = dragData?.translateY || 0;

    const newDragData = {
      ...dragData,
      translateX,
      translateY,
      deltaX: 0,
      deltaY: 0,
      x: positionX, y: positionY,
      lastX: positionX,
      lastY: positionY,
      zIndex: zIndexRange[1],
      node
    }

    this.dragging = true;
    this.setState({
      dragged: true,
      isSVG: isElementSVG(data?.node),
      dragData: newDragData
    });
    onDragStart && onDragStart(e, newDragData);
  };

  onDrag: EventHandler = (e, data) => {
    if (!this.dragging || !data) return;
    const { dragData } = this.state;
    const { zIndexRange, scale, bounds, onDrag } = this.props;
    let x = dragData?.x ?? 0;
    const y = dragData?.y ?? 0;
    let translateX = dragData?.translateX ?? 0;
    let translateY = dragData?.translateY ?? 0;

    // 拖拽生成的位置信息
    const newDragData = {
      node: data.node,
      zIndex: zIndexRange[1],
      translateX: this.canDragX() ? (translateX + (data?.deltaX / scale)) : translateX,
      translateY: this.canDragY() ? (translateY + (data.deltaY / scale)) : translateY,
      x: this.canDragX() ? (x + (data?.deltaX / scale)) : x,
      y: this.canDragY() ? (y + (data.deltaY / scale)) : y,
      deltaX: (data.deltaX / scale),
      deltaY: (data.deltaY / scale),
      lastX: x,
      lastY: y
    };

    if (!newDragData) return;

    let nowX = newDragData?.x;
    let nowY = newDragData?.y;

    // 运动边界限制
    if (bounds) {
      nowX += this.slackX;
      nowY += this.slackY;

      // 边界处理
      const node = data?.node;

      const newPositionXY = getPositionByBounds(node, { x: nowX, y: nowY }, bounds);
      nowX = newPositionXY.x;
      nowY = newPositionXY.y;
      const nowTranslateX = translateX + nowX - x;
      const nowTranslateY = translateY + nowY - y;

      // 重新计算越界补偿, 用来修正越界后鼠标真实的位置变化
      const newSlackX = this.slackX + (newDragData.x - nowX);
      const newSlackY = this.slackY + (newDragData.y - nowY);
      this.slackX = newSlackX;
      this.slackY = newSlackY;

      // 更新
      newDragData.x = nowX;
      newDragData.y = nowY;
      newDragData.translateX = nowTranslateX;
      newDragData.translateY = nowTranslateY;
      newDragData.deltaX = nowX - (dragData?.x || 0);
      newDragData.deltaY = nowY - (dragData?.y || 0);
    }

    this.setState({
      dragData: newDragData
    });
    onDrag && onDrag(e, newDragData);
  };

  onDragStop: EventHandler = (e, data) => {
    const { dragData } = this.state;
    const { zIndexRange, onDragStop } = this.props;
    if (!this.dragging || !dragData) return;

    const newDragData = {
      ...dragData,
      deltaX: 0,
      deltaY: 0,
      zIndex: zIndexRange[0]
    }
    onDragStop && onDragStop(e, newDragData);
    this.dragging = false;
    this.slackX = 0;
    this.slackY = 0;
    this.setState({
      // dragData: newDragData
    });
    console.log(11111, new Date().getTime())
  };

  canDragX = () => {
    const { axis } = this.props;
    return axis?.includes(DragAxis.x);
  };

  canDragY = () => {
    const { axis } = this.props;
    return axis?.includes(DragAxis.y);
  };

  render() {
    const { children, className, style, positionOffset, transform, forwardedRef, ...DraggableEventProps } = this.props;
    const { isSVG, dragged, dragData } = this.state;
    // 包裹元素的className
    const cls = classNames((children.props?.className || ''), wrapClassName, className, {
      [wrapClassNameDragging]: this.dragging,
      [wrapClassNameDragged]: dragged
    });

    // 当前位置
    const currentPosition = {
      x: dragData?.translateX || 0,
      y: dragData?.translateY || 0
    };

    // React.Children.only限制只能传递一个child
    return (
      <DraggableEvent ref={forwardedRef} {...DraggableEventProps} onDragStart={this.onDragStart} onDrag={this.onDrag} onDragStop={this.onDragStop}>
        {React.cloneElement(React.Children.only(children), {
          className: cls,
          style: mergeObject({ ...children.props.style, ...style }, {
            transform: !isSVG ? createCSSTransform(currentPosition, positionOffset) : style?.transform ?? (children.props.style?.transform || ""),
            zIndex: dragData?.zIndex ?? style?.zIndex ?? children?.props?.style?.zIndex
          }),
          transform: isSVG ? createSVGTransform(currentPosition, positionOffset) : (transform ?? (children.props?.transform || "")),
        })}
      </DraggableEvent>
    );
  }
}

const wrapper = function (InnerComponent: any): any {
  return React.forwardRef((props, ref) => {
    return (
      <InnerComponent forwardedRef={ref} {...props} />
    )
  })
}

export default wrapper(Draggable)