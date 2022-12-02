import React from 'react';
import classNames from 'classnames';
import { DraggableProps, EventHandler, DragTypes, DragData, BoundsInterface, DraggableState } from "./utils/types";
import { isElementSVG } from "@/utils/verify";
import DraggableEvent from './DraggableEvent';
import { findElement, getInsidePosition } from '@/utils/dom';
import ReactDOM from 'react-dom';
import { getPositionByBounds, getTranslation } from './utils/utils';

/**
 * 拖拽组件---transform移动组件
 */
const wrapClassName = "react-draggable";
const wrapClassNameDragging = "react-draggable-dragging";
const wrapClassNameDragged = "react-draggable-dragged";
class Draggable extends React.Component<DraggableProps, DraggableState> {
  // 初始位置
  initX: number | undefined;
  initY: number | undefined;
  // 拖拽补偿
  slackX: number;
  slackY: number;
  dragType: DragTypes | undefined;
  dragStartData?: DragData;
  isUninstall: boolean | undefined;
  constructor(props: DraggableProps) {
    super(props);
    this.slackX = 0;
    this.slackY = 0;
    // dragStart时的数据
    this.state = {
      isSVG: false
    };
  }

  componentDidMount() {
    const child = this.findDOMNode();
    const parent = this.getBoundsParent();
    const pos = getInsidePosition(child, parent);
    if (pos) {
      this.initX = pos?.left;
      this.initY = pos?.top;
      this.setDragdata(this.state.dragData, this.props?.x, this.props?.y);
    }
  }

  componentWillUnmount() {
    this.isUninstall = true;
  }

  // 根据输入的x，y位置转换为translate距离
  setDragdata = (oldDragData: DragData | undefined, newX?: number, newY?: number) => {
    const child = this.findDOMNode();
    const initX = this.initX;
    const initY = this.initY;
    if (typeof initX !== 'number' || typeof initY !== 'number') return;
    const translateX = typeof newX === 'number' ? (newX - initX) : oldDragData?.translateX;
    const translateY = typeof newY === 'number' ? (newY - initY) : oldDragData?.translateY;
    const newDragData = {
      ...oldDragData,
      x: newX,
      y: newY,
      translateX,
      translateY
    } as DragData
    this.setState({
      dragData: newDragData,
      isSVG: isElementSVG(child)
    });
    // 设置完translate初始化dragType
    this.dragType = undefined;
    return newDragData;
  }

  // 非拖拽情况，只靠x, y设置位置
  componentDidUpdate(prevProps: DraggableProps, prevState: DraggableState) {
    const { x, y } = this.props;
    const { x: prevX, y: prevY } = prevProps;
    const dragType = this.dragType;
    const xChanged = x !== undefined && x !== prevX;
    const yChanged = y !== undefined && y !== prevY;
    if (xChanged || yChanged) {
      if (!dragType) {
        this.setDragdata(prevState?.dragData, x, y);
      }
    }
  }

  static getDerivedStateFromProps(nextProps: DraggableProps, prevState: DraggableState) {
    const xChanged = nextProps.x !== prevState.prevX;
    const yChanged = nextProps.y !== prevState.prevY;
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

  findDOMNode() {
    return this.props?.forwardedRef?.current || ReactDOM.findDOMNode(this);
  }

  // 获取定位父元素，涉及的位置相对于该父元素
  getBoundsParent = () => {
    const { bounds } = this.props;
    const parent = findElement(bounds) || findElement((bounds as BoundsInterface)?.element) || document.body || document.documentElement;
    return parent;
  }

  onStart: EventHandler = (e, eventData) => {
    this.dragType = DragTypes.Start;
    const node = eventData?.target;
    const parent = this.getBoundsParent();
    const pos = getInsidePosition(node, parent);
    if (!eventData || !pos) return;
    let positionX = pos?.left;
    let positionY = pos?.top;
    const { dragData } = this.state;
    const { onStart } = this.props;

    const newDragData = {
      ...eventData,
      ...dragData,
      x: positionX,
      y: positionY
    }

    this.setState({
      dragData: newDragData
    });
    this.dragStartData = newDragData
    onStart && onStart(e, newDragData);
  };

  onMove: EventHandler = (e, eventData) => {
    const dragType = this.dragType;
    if (!eventData || !dragType) return;
    this.dragType = DragTypes.Move;
    const { dragData } = this.state;
    const { bounds, onMove } = this.props;
    const lastX = dragData?.x ?? 0;
    const lastY = dragData?.y ?? 0;
    let translateX = dragData?.translateX ?? 0;
    let translateY = dragData?.translateY ?? 0;
    const { target, deltaX, deltaY } = eventData;
    const calculationX = lastX + deltaX;
    const calculationY = lastY + deltaY;
    let nowX = calculationX;
    let nowY = calculationY;
    let nowTranslateX = translateX + deltaX;
    let nowTranslateY = translateY + deltaY;

    // 运动边界限制
    if (bounds) {
      const slackX = this.slackX;
      const slackY = this.slackY;
      // 计算在边界之内的位置
      const boundsXY = getPositionByBounds(target, { x: nowX + slackX, y: nowY + slackY }, bounds);
      nowX = boundsXY.x;
      nowY = boundsXY.y;
      nowTranslateX = translateX + (nowX - lastX);
      nowTranslateY = translateY + (nowY - lastY);

      // 超出边界记录距离，否则记录为0
      const newSlackX = slackX + (calculationX - nowX);
      const newSlackY = slackY + (calculationY - nowY);
      this.slackX = newSlackX;
      this.slackY = newSlackY;
    }

    // 拖拽生成的位置信息
    const newDragData = {
      ...eventData,
      translateX: nowTranslateX,
      translateY: nowTranslateY,
      x: nowX,
      y: nowY
    };

    this.setState({
      dragData: newDragData
    });
    onMove && onMove(e, newDragData);
  };

  onEnd: EventHandler = (e, eventData) => {
    const { dragData } = this.state;
    const dragType = this.dragType;
    const isUninstall = this.isUninstall;
    const dragStartData = this.dragStartData;
    const { restoreOnEnd, onEnd, x, y } = this.props;
    if (!dragType || !dragData) return;
    this.slackX = 0;
    this.slackY = 0;
    const endData = { ...eventData, ...dragData };
    // 回调函数先执行然后再重置状态
    onEnd && onEnd(e, endData);
    // 组件没卸载情况下设置位置
    if (!isUninstall) {
      // 根据props值设置translate
      const xChanged = x !== undefined && x !== dragData?.x;
      const yChanged = y !== undefined && y !== dragData?.y;
      if (restoreOnEnd) {
        this.setDragdata(dragStartData, undefined, undefined);
      } else if (xChanged || yChanged) {
        this.setDragdata(dragStartData, x, y);
      }
    }
  };

  render() {
    const {
      children,
      className,
      style,
      x,
      y,
      positionOffset,
      transform,
      forwardedRef,
      restoreOnEnd,
      bounds,
      ...DraggableEventProps
    } = this.props;
    const { isSVG, dragData } = this.state;
    const dragType = this.dragType;
    // 包裹元素的className
    const cls = classNames((children.props?.className || ''), wrapClassName, className, {
      [wrapClassNameDragging]: dragType === DragTypes.Move,
      [wrapClassNameDragged]: dragType
    });

    // 当前位置
    const currentPosition = {
      x: dragData?.translateX,
      y: dragData?.translateY
    };

    const mergeStyle = { ...children.props.style, ...style }
    const transformValue = isSVG ? getTranslation(currentPosition, positionOffset, '') : getTranslation(currentPosition, positionOffset, 'px')
    const transformSet = isSVG ? { transform: transformValue, style: mergeStyle } : { style: { ...mergeStyle, transform: transformValue } }

    return (
      <DraggableEvent
        ref={forwardedRef}
        {...DraggableEventProps}
        {...transformSet}
        className={cls}
        onStart={this.onStart}
        onMove={this.onMove}
        onEnd={this.onEnd}>
        {children}
      </DraggableEvent>
    );
  }
}

const wrapper = function (InnerComponent: typeof Draggable) {
  return React.forwardRef((props: any, ref) => {
    return (
      <InnerComponent forwardedRef={ref} {...props} />
    )
  })
}

export default wrapper(Draggable)
