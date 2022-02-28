import React, { useEffect, useRef, useState, CSSProperties, useImperativeHandle, useContext } from 'react';
import Draggable, { DragHandler as DragEventHandler, DragAxisCode } from "@/components/react-free-draggable";
import { ChildrenType, DragTypes } from "./utils/types";
import classNames from "classnames";
import { getOffsetWH } from "@/utils/dom";
import { DraggerContext } from './DraggableAreaBuilder';

export type EventType = MouseEvent | TouchEvent;
export type DraggerItemHandler<E = EventType, T = DraggerItemEvent> = (e: E, data: T) => void | boolean;
export interface DraggerItemEvent {
  width: number;
  height: number;
  x: number;
  y: number;
  translateX?: number;
  translateY?: number;
  node: HTMLElement;
  dragType?: DragTypes;
  id: string | number;
}

export interface DraggerProps {
  children: ChildrenType;
  className?: string;
  style?: CSSProperties;
  onDragStart?: DraggerItemHandler;
  onDrag?: DraggerItemHandler;
  onDragEnd?: DraggerItemHandler;
  dragAxis?: string[];
  handle?: string | HTMLElement;
  id: string | number;
}

// 拖拽及缩放组件
const DraggerItem = React.forwardRef<any, DraggerProps>((props, ref) => {

  const {
    children,
    className,
    style,
    dragAxis = DragAxisCode,
    handle,
    id
  } = props;

  const [dragType, setDragType] = useState<DragTypes>();
  const context = useContext(DraggerContext);
  const { draggerItems } = context;
  const nodeRef = useRef<any>();
  const lastZIndexRef = useRef<string>('');

  useImperativeHandle(ref, () => ({
    node: nodeRef?.current
  }));

  useEffect(() => {
    const node = nodeRef.current;
    draggerItems?.push({ node, id });
  }, []);

  // 可以拖拽
  const canDrag = () => {
    return DragAxisCode?.some((axis) => dragAxis?.includes(axis));
  };

  const onDragStart: DragEventHandler = (e, data) => {
    if (!data || !canDrag()) return false;
    setDragType(DragTypes.dragStart);
    const node = data?.node;
    const offsetWH = getOffsetWH(node);
    if (!offsetWH) return false;
    lastZIndexRef.current = data?.node?.style?.zIndex;
    return context?.onDragStart && context?.onDragStart(e, {
      width: offsetWH?.width,
      height: offsetWH?.height,
      translateX: data?.translateX,
      translateY: data?.translateY,
      x: data?.x || 0,
      y: data?.y || 0,
      node: node,
      dragType: DragTypes.dragStart,
      id
    });
  };

  const onDrag: DragEventHandler = (e, data) => {
    if (!data || !canDrag()) return false;
    const node = data?.node;
    setDragType(DragTypes.draging);
    const offsetWH = getOffsetWH(node);
    if (!offsetWH) return false;
    if (data.node?.style?.zIndex !== '999') {
      data.node.style.zIndex = '999';
    }
    return context?.onDrag && context?.onDrag(e, {
      width: offsetWH?.width,
      height: offsetWH?.height,
      translateX: data?.translateX,
      translateY: data?.translateY,
      x: data?.x || 0,
      y: data?.y || 0,
      node: node,
      dragType: DragTypes.draging,
      id
    });
  };

  const onDragStop: DragEventHandler = (e, data) => {
    if (!data || !canDrag()) return false;
    setDragType(DragTypes.dragEnd);
    const node = data?.node;
    const offsetWH = getOffsetWH(node);
    if (!offsetWH) return false;
    data.node.style.zIndex = lastZIndexRef.current;
    return context?.onDragEnd && context?.onDragEnd(e, {
      width: offsetWH?.width,
      height: offsetWH?.height,
      translateX: data?.translateX,
      translateY: data?.translateY,
      x: data?.x || 0,
      y: data?.y || 0,
      node: node,
      dragType: DragTypes.dragEnd,
      id
    });
  };

  const cls = classNames((children?.props?.className || ''), className);

  // 可拖拽子元素
  const NormalItem = (
    <Draggable
      ref={nodeRef}
      className={cls}
      axis={dragAxis}
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragStop={onDragStop}
      handle={handle}
      fixed
    >
      {
        React.cloneElement(React.Children.only(children), {
          style: {
            ...children.props.style,
            ...style,
            transition: dragType ? '' : 'all .2s ease-out'
          }
        })
      }
    </Draggable>
  );

  return NormalItem;
});

export default DraggerItem;
