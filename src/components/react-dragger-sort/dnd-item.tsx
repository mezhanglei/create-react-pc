import React, { useEffect, useRef, useState, CSSProperties, useImperativeHandle, useContext } from 'react';
import Draggable, { DragHandler as DragEventHandler, DragAxisCode } from "@/components/react-free-draggable";
import { ChildrenType, DragTypes, DndTargetItemType } from "./utils/types";
import classNames from "classnames";
import { getOffsetWH } from "@/utils/dom";
import { DndAreaContext } from './dnd-area-context';

export type EventType = MouseEvent | TouchEvent;
export type DndItemHandler<E = EventType, T = DndSourceItem> = (e: E, data: T) => void | boolean;
export interface DndSourceItem {
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

export interface DndProps {
  children: ChildrenType;
  className?: string;
  style?: CSSProperties;
  onDragStart?: DndItemHandler;
  onDrag?: DndItemHandler;
  onDragEnd?: DndItemHandler;
  dragAxis?: string[];
  handle?: string | HTMLElement;
  id: string | number;
}

// 拖拽及缩放组件
const DndItem = React.forwardRef<any, DndProps>((props, ref) => {

  const {
    children,
    className,
    style,
    dragAxis = DragAxisCode,
    handle,
    id
  } = props;

  const [dragType, setDragType] = useState<DragTypes>();
  const context = useContext(DndAreaContext);
  const { dndItems, targetItem } = context;
  const nodeRef = useRef<any>();
  const lastZIndexRef = useRef<string>('');

  useImperativeHandle(ref, () => ({
    node: nodeRef?.current
  }));

  useEffect(() => {
    const node = nodeRef.current;
    dndItems?.push({ node, id });
  }, []);

  const isOver = (targetItem?: DndTargetItemType, child?: HTMLElement) => {
    if (targetItem && targetItem?.node === child) {
      return true;
    };
  };

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
            opacity: isOver(targetItem, nodeRef.current) ? '0.8' : children?.props?.style?.opacity,
            transition: dragType ? '' : 'all .2s ease-out'
          }
        })
      }
    </Draggable>
  );

  return NormalItem;
});

export default DndItem;
