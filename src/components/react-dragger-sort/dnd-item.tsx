import React, { useEffect, useRef, useState, CSSProperties, useImperativeHandle, useContext } from 'react';
import Draggable, { DragHandler as DragEventHandler, DragAxisCode } from "@/components/react-free-draggable";
import { ChildrenType, DndTargetItemType, DragTypes } from "./utils/types";
import classNames from "classnames";
import { getOffsetWH } from "@/utils/dom";
import { DndAreaContext, DndProviderContext } from './dnd-context';

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
  index: number;
}

export interface DndProps {
  children: ChildrenType;
  className?: string;
  style?: CSSProperties;
  onDragStart?: DndItemHandler;
  onDrag?: DndItemHandler;
  onDragEnd?: DndItemHandler;
  dragAxis?: string[];
  index: number;
}

// 拖拽及缩放组件
const DndItem = React.forwardRef<any, DndProps>((props, ref) => {

  const {
    children,
    className,
    style,
    index,
    dragAxis = DragAxisCode,
    ...option
  } = props;

  const [dragType, setDragType] = useState<DragTypes>();
  const { onDragStart, onDrag, onDragEnd, targetItem } = useContext(DndAreaContext);
  const { store } = useContext(DndProviderContext);
  const { setDndItemsMap } = store;
  const nodeRef = useRef<any>();
  const lastZIndexRef = useRef<string>('');

  useImperativeHandle(ref, () => ({
    node: nodeRef?.current
  }));

  useEffect(() => {
    const node = nodeRef.current;
    if (index !== undefined && node !== null) {
      setDndItemsMap(node, { node, index });
    }
  }, [index]);

  // 可以拖拽
  const canDrag = () => {
    return DragAxisCode?.some((axis) => dragAxis?.includes(axis));
  };

  const onDragStartHandle: DragEventHandler = (e, data) => {
    if (!data || !canDrag()) return false;
    setDragType(DragTypes.dragStart);
    const node = data?.node;
    const offsetWH = getOffsetWH(node);
    if (!offsetWH) return false;
    lastZIndexRef.current = data?.node?.style?.zIndex;
    return onDragStart && onDragStart(e, {
      width: offsetWH?.width,
      height: offsetWH?.height,
      translateX: data?.translateX,
      translateY: data?.translateY,
      x: data?.x || 0,
      y: data?.y || 0,
      node: node,
      dragType: DragTypes.dragStart,
      index
    });
  };

  const onDragHandle: DragEventHandler = (e, data) => {
    if (!data || !canDrag()) return false;
    const node = data?.node;
    setDragType(DragTypes.draging);
    const offsetWH = getOffsetWH(node);
    if (!offsetWH) return false;
    if (data.node?.style?.zIndex !== '999') {
      data.node.style.zIndex = '999';
    }
    return onDrag && onDrag(e, {
      width: offsetWH?.width,
      height: offsetWH?.height,
      translateX: data?.translateX,
      translateY: data?.translateY,
      x: data?.x || 0,
      y: data?.y || 0,
      node: node,
      dragType: DragTypes.draging,
      index
    });
  };

  const onDragStopHandle: DragEventHandler = (e, data) => {
    if (!data || !canDrag()) return false;
    setDragType(DragTypes.dragEnd);
    const node = data?.node;
    const offsetWH = getOffsetWH(node);
    if (!offsetWH) return false;
    data.node.style.zIndex = lastZIndexRef.current;
    return onDragEnd && onDragEnd(e, {
      width: offsetWH?.width,
      height: offsetWH?.height,
      translateX: data?.translateX,
      translateY: data?.translateY,
      x: data?.x || 0,
      y: data?.y || 0,
      node: node,
      dragType: DragTypes.dragEnd,
      index
    });
  };

  const cls = classNames((children?.props?.className || ''), className);
  const isHover = targetItem && targetItem?.node === nodeRef.current;

  // 可拖拽子元素
  const NormalItem = (
    <Draggable
      {...option}
      ref={nodeRef}
      className={cls}
      axis={dragAxis}
      onDragStart={onDragStartHandle}
      onDrag={onDragHandle}
      onDragStop={onDragStopHandle}
      fixed
    >
      {
        React.cloneElement(React.Children.only(children), {
          style: {
            ...children.props.style,
            ...style,
            opacity: isHover ? '0.8' : children.props?.style?.opacity,
            transition: dragType ? '' : 'all .2s ease-out'
          },
          isHover
        })
      }
    </Draggable>
  );

  return NormalItem;
});

export default DndItem;
