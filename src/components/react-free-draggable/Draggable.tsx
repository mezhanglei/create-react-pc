import React from 'react';
import classNames from 'classnames';
import { getPositionByBounds, getTranslation } from './utils/dom';
import { DraggableProps, EventHandler, DragTypes, DragData, BoundsInterface, DraggableState, DragEventData } from "./utils/types";
import { isElementSVG } from "@/utils/verify";
import DraggableEvent from './DraggableEvent';
import { findElement, getInsidePosition } from '@/utils/dom';
import { deepMergeObject } from '@/utils/object';
import ReactDOM from 'react-dom';

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
  lastDragData: DragData | {};
  isUninstall: boolean | undefined;
  constructor(props: DraggableProps) {
    super(props);
    this.slackX = 0;
    this.slackY = 0;
    this.lastDragData = {};
    // dragStart时的数据
    this.state = {
      dragData: {},
      isSVG: false
    };
  }

  componentDidMount() {
    const child = this.findDOMNode();
    const parent = this.getBoundsParent();
    const pos = getInsidePosition(child, parent);
    const initXY = pos && {
      x: pos?.left,
      y: pos?.top
    };
    this.initX = initXY?.x;
    this.initY = initXY?.y;
    this.setDragdata(this.state.dragData, this.props?.x, this.props?.y);
  }

  componentWillUnmount() {
    this.isUninstall = true;
  }

  // 非拖拽元素设置translate，根据输入的x，y位置转换为translate距离
  setDragdata = (oldDragData: DragData, newX?: number, newY?: number) => {
    const child = this.findDOMNode();
    const initX = this.initX;
    const initY = this.initY;
    if (typeof initX !== 'number' || typeof initY !== 'number') return;
    const translateX = typeof newX === 'number' ? (newX - initX) : undefined;
    const translateY = typeof newY === 'number' ? (newY - initY) : undefined;
    const newDragData = deepMergeObject(oldDragData, {
      x: newX,
      y: newY,
      translateX,
      translateY
    })
    this.setState({
      dragData: newDragData,
      isSVG: isElementSVG(child)
    });
    // 设置完translate初始化dragType
    this.dragType = undefined;
    return newDragData;
  }

  // 仅仅当为受控组件，且非拖拽的组件，设置值
  componentDidUpdate(prevProps: DraggableProps, prevState: DraggableState) {
    const xChanged = this.props.x !== undefined && this.props.x !== prevProps.x;
    const yChanged = this.props.y !== undefined && this.props.y !== prevProps.y;
    if (xChanged || yChanged) {
      if (!this.dragType) {
        this.setDragdata(prevState?.dragData, this.props.x, this.props.y);
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

  onStart: EventHandler = (e, data) => {
    this.dragType = DragTypes.Start;
    const node = data?.node;
    const parent = this.getBoundsParent();
    const pos = getInsidePosition(node, parent);
    if (!data || !pos) return;
    let positionX = pos?.left;
    let positionY = pos?.top;
    const { dragData } = this.state;
    const { onStart } = this.props;

    const translateX = dragData?.translateX;
    const translateY = dragData?.translateY;

    const newDragData = {
      ...dragData,
      translateX,
      translateY,
      x: positionX, y: positionY,
      deltaX: data?.deltaX,
      deltaY: data?.deltaY,
      node
    }

    this.setState({
      dragData: newDragData
    });
    this.lastDragData = newDragData
    onStart && onStart(e, newDragData);
  };

  onMove: EventHandler = (e, data) => {
    const dragType = this.dragType;
    if (!dragType || !data) return;
    this.dragType = DragTypes.Move;
    const { dragData } = this.state;
    const { bounds, onMove } = this.props;
    let x = dragData?.x ?? 0;
    const y = dragData?.y ?? 0;
    let translateX = dragData?.translateX ?? 0;
    let translateY = dragData?.translateY ?? 0;

    // 拖拽生成的位置信息
    const newDragData = {
      node: data.node,
      translateX: translateX + data?.deltaX,
      translateY: translateY + data.deltaY,
      deltaX: data?.deltaX,
      deltaY: data?.deltaY,
      x: x + data?.deltaX,
      y: y + data.deltaY
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

      const boundsXY = getPositionByBounds(node, { x: nowX, y: nowY }, bounds);
      nowX = boundsXY.x;
      nowY = boundsXY.y;
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
    }

    this.setState({
      dragData: newDragData
    });
    onMove && onMove(e, newDragData);
  };

  onEnd: EventHandler = (e, data) => {
    const { dragData } = this.state;
    const dragType = this.dragType;
    const { onEnd } = this.props;
    if (!dragType || !dragData) return;
    this.dragType = DragTypes.End;
    this.slackX = 0;
    this.slackY = 0;
    const beforeEndDragData = {
      ...dragData
    }
    // 回调函数先执行然后再重置状态
    onEnd && onEnd(e, beforeEndDragData as DragEventData);
    // 注意是否已经组件卸载
    if (!this.isUninstall) {
      // 根据props值设置translate
      const xChanged = this.props.x !== undefined && this.props.x !== beforeEndDragData?.x;
      const yChanged = this.props.y !== undefined && this.props?.y !== beforeEndDragData?.y;
      if (xChanged || yChanged) {
        this.setDragdata(this.lastDragData, this.props?.x, this.props?.y);
      } else if (this.props.fixed) {
        this.setDragdata(this.lastDragData, undefined, undefined)
      }
    }
  };

  render() {
    const { children, className, style, positionOffset, transform, forwardedRef, ...DraggableEventProps } = this.props;
    const { isSVG, dragData } = this.state;
    // 包裹元素的className
    const cls = classNames((children.props?.className || ''), wrapClassName, className, {
      [wrapClassNameDragging]: this.dragType === DragTypes.Move,
      [wrapClassNameDragged]: this.dragType
    });

    // 当前位置
    const currentPosition = {
      x: dragData?.translateX,
      y: dragData?.translateY
    };

    return (
      <DraggableEvent
        ref={forwardedRef}
        {...DraggableEventProps}
        style={deepMergeObject({ ...children.props.style, ...style }, {
          transform: !isSVG && getTranslation(currentPosition, positionOffset, 'px')
        })}
        showLayer={false}
        className={cls}
        transform={isSVG ? getTranslation(currentPosition, positionOffset, '') : transform}
        onStart={this.onStart}
        onMove={this.onMove}
        onEnd={this.onEnd}>
        {children}
      </DraggableEvent>
    );
  }
}

const wrapper = function (InnerComponent: typeof Draggable) {
  return React.forwardRef((props: DraggableProps, ref) => {
    return (
      <InnerComponent forwardedRef={ref} {...props} />
    )
  })
}

export default wrapper(Draggable)