import React, { useEffect, useRef, useState, CSSProperties, useImperativeHandle } from 'react';
import { DragHandler as DragEventHandler, DragDirectionCode, DraggableEvent } from "@/components/react-free-draggable";
import { TargetParams, DragTypes, SourceParams, DndCallBackProps } from "./utils/types";
import classNames from "classnames";
import { getClientXY, getOffsetWH } from "@/utils/dom";
import { DndManager } from './dnd-manager';

export type EventType = MouseEvent | TouchEvent;
export interface DragMoveParams extends SourceParams {
  target?: TargetParams
}
// 拖拽自身的回调函数
export type DragMoveHandle = (params: DragMoveParams) => void;
export interface DndSourceItem {
  width: number;
  height: number;
  x: number;
  y: number;
  node: HTMLElement;
  dragType?: DragTypes;
  path: string
}

export interface DndProps extends DndCallBackProps {
  children: any;
  className?: string;
  style?: CSSProperties;
  onStart?: DragMoveHandle;
  onMove?: DragMoveHandle;
  onEnd?: DragMoveHandle;
  direction?: string[];
  path?: string
}

export default function BuildDndSortable() {

  const dndManager = new DndManager();

  // 提供拖拽和放置的组件
  const DndCore = React.forwardRef<any, DndProps>((props, ref) => {

    const {
      children,
      className,
      style,
      direction = DragDirectionCode,
      path,
      ...rest
    } = props;

    const [dragType, setDragType] = useState<DragTypes>();
    const nodeRef = useRef<any>();
    const lastZIndexRef = useRef<string>('');
    const currentPath = path;

    useImperativeHandle(ref, () => ({
      node: nodeRef?.current
    }));

    // 监听碰撞事件
    useEffect(() => {
      const currentNode = nodeRef.current;
      if (currentNode !== null && typeof currentPath == 'string' && currentPath) {
        const data = {
          node: currentNode,
          path: currentPath,
          ...rest
        }
        dndManager.subscribe(data);
        dndManager.setDndItemsMap(data);
      }
      return () => {
        dndManager.unsubscribe(currentNode)
      }
    }, [currentPath]);

    // 可以拖拽
    const canDrag = () => {
      return DragDirectionCode?.some((dir) => direction?.includes(dir)) && currentPath !== undefined;
    };

    // 当前元素的拖拽事件
    const onStartHandle: DragEventHandler = (e, data) => {
      const node = data?.node;
      const offsetWH = getOffsetWH(node);
      const clientXY = getClientXY(node)
      if (!data || !offsetWH || !clientXY || !currentPath) return false;
      setDragType(DragTypes.dragStart);
      lastZIndexRef.current = data?.node?.style?.zIndex;
      const params = {
        node: node,
        dragType: DragTypes.dragStart,
        path: currentPath,
        x: data?.x as number,
        y: data?.y as number,
        width: offsetWH?.width,
        height: offsetWH?.height
      }
      rest.onStart && rest.onStart({ e, source: params })
    };

    // 当前元素的拖拽事件
    const onMoveHandle: DragEventHandler = (e, data) => {
      const node = data?.node;
      const offsetWH = getOffsetWH(node);
      if (!data || !offsetWH || !currentPath) return false;
      setDragType(DragTypes.draging);
      if (node?.style?.zIndex !== '999') {
        node.style.zIndex = '999';
      }
      const sourceParams = {
        e,
        source: {
          node: node,
          dragType: DragTypes.draging,
          path: currentPath,
          x: data?.x as number,
          y: data?.y as number,
          width: offsetWH?.width,
          height: offsetWH?.height
        }
      }
      const targetItem = dndManager.findNearest(sourceParams);
      rest.onMove && rest.onMove({ ...sourceParams, target: targetItem });
      notify(sourceParams, targetItem)
    };

    // 当前元素的拖拽事件
    const onEndHandle: DragEventHandler = (e, data) => {
      const node = data?.node;
      const offsetWH = getOffsetWH(node);
      if (!data || !offsetWH || !currentPath) return false;
      setDragType(DragTypes.dragEnd);
      node.style.zIndex = lastZIndexRef.current;
      const sourceParams = {
        e,
        source: {
          node: node,
          dragType: DragTypes.dragEnd,
          path: currentPath,
          x: data?.x as number,
          y: data?.y as number,
          width: offsetWH?.width,
          height: offsetWH?.height
        }
      }
      const targetItem = dndManager.findNearest(sourceParams);
      rest.onEnd && rest.onEnd({ ...sourceParams, target: targetItem });
      notify(sourceParams, targetItem)
    };

    // 触发订阅的事件
    const notify = (source: SourceParams, target?: TargetParams) => {
      // 只有有碰撞元素才会触发
      if (source) {
        const result = {
          ...source,
          target: target
        };
        dndManager.notifyEvent(result)
      }
    }

    const cls = classNames((children?.props?.className || ''), className);
    const isDrag = dragType && [DragTypes.draging, DragTypes.dragStart]?.includes(dragType);

    return (
      <DraggableEvent
        ref={nodeRef}
        className={cls}
        direction={direction}
        disabled={!canDrag()}
        onStart={onStartHandle}
        onMove={onMoveHandle}
        onEnd={onEndHandle}
        style={{
          ...style,
          // visibility: isDrag ? 'hidden' : '',
          // transition: isDrag ? '' : 'all 0.2s'
        }}
      >
        <div>
          {children}
        </div>
      </DraggableEvent>
    );
  });

  return DndCore;
};