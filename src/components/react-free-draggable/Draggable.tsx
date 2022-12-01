import React from 'react';
import classNames from 'classnames';
import { DraggableProps, EventHandler, DragTypes, DragData, BoundsInterface, DraggableState, DragEventData } from "./utils/types";
import { isElementSVG } from "@/utils/verify";
import DraggableEvent from './DraggableEvent';
import { findElement, getInsidePosition } from '@/utils/dom';
import { deepMergeObject } from '@/utils/object';
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
 
   // 仅仅当为受控组件，且非正在拖拽的组件，位置变化时
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
 
   onStart: EventHandler = (e) => {
     this.dragType = DragTypes.Start;
     const node = e?.target;
     const deltaX = e?.deltaX;
     const deltaY = e?.deltaY;
     const parent = this.getBoundsParent();
     const pos = getInsidePosition(node, parent);
     if (!pos) return;
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
       deltaX: deltaX,
       deltaY: deltaY,
       target: node
     }
 
     this.setState({
       dragData: newDragData
     });
     this.lastDragData = newDragData
     onStart && onStart({ ...e, ...newDragData });
   };
 
   onMove: EventHandler = (e) => {
     const dragType = this.dragType;
     if (!dragType) return;
     this.dragType = DragTypes.Move;
     const { dragData } = this.state;
     const { bounds, onMove } = this.props;
     let x = dragData?.x ?? 0;
     const y = dragData?.y ?? 0;
     let translateX = dragData?.translateX ?? 0;
     let translateY = dragData?.translateY ?? 0;
     const { target, deltaX, deltaY } = e;
 
     // 拖拽生成的位置信息
     const newDragData = {
       target: target,
       translateX: translateX + deltaX,
       translateY: translateY + deltaY,
       deltaX: deltaX,
       deltaY: deltaY,
       x: x + deltaX,
       y: y + deltaY
     };
 
     if (!newDragData) return;
 
     let nowX = newDragData?.x;
     let nowY = newDragData?.y;
 
     // 运动边界限制
     if (bounds) {
       nowX += this.slackX;
       nowY += this.slackY;
 
       const boundsXY = getPositionByBounds(target, { x: nowX, y: nowY }, bounds);
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
     onMove && onMove({ ...e, ...newDragData });
   };
 
   onEnd: EventHandler = (e) => {
     const { dragData } = this.state;
     const dragType = this.dragType;
     const isUninstall = this.isUninstall;
     const lastDragData = this.lastDragData;
     const { restoreOnEnd, onEnd, x, y } = this.props;
     if (!dragType || !dragData) return;
     this.dragType = DragTypes.End;
     this.slackX = 0;
     this.slackY = 0;
     // 回调函数先执行然后再重置状态
     onEnd && onEnd({ ...e, ...dragData as DragEventData });
     // 注意是否已经组件卸载
     if (!isUninstall) {
       // 根据props值设置translate
       const xChanged = x !== undefined && x !== dragData?.x;
       const yChanged = y !== undefined && y !== dragData?.y;
       if (restoreOnEnd) {
         this.setDragdata(lastDragData, undefined, undefined);
       } else if (xChanged || yChanged) {
         this.setDragdata(lastDragData, x, y);
       }
     }
   };
 
   render() {
     const { children, className, style, positionOffset, transform, forwardedRef, ...DraggableEventProps } = this.props;
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
 
     return (
       <DraggableEvent
         ref={forwardedRef}
         {...DraggableEventProps}
         style={deepMergeObject({ ...children.props.style, ...style }, {
           transform: !isSVG && getTranslation(currentPosition, positionOffset, 'px')
         })}
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
 