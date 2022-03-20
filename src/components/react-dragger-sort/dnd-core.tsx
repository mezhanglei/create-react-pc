import React, { useEffect, useRef, useState, CSSProperties, useImperativeHandle, useContext } from 'react';
import Draggable, { DragHandler as DragEventHandler, DragAxisCode } from "@/components/react-free-draggable";
import { TargetParams, DragMoveHandle, DragTypes, listenEvent, ListenParams, NotifyEventHandle, SourceParams, SubscribeHandle } from "./utils/types";
import classNames from "classnames";
import { getClientXY, getEventPosition, getInsidePosition, getOffsetWH, setStyle } from "@/utils/dom";
import { DndChildrenContext } from './dnd-context';
import { getMinDistance, isMoveIn } from './utils/dom';
import { indexToArray } from '@/pages/demo8/utils';

export type EventType = MouseEvent | TouchEvent;
export type DndItemHandler<E = EventType, T = DndSourceItem> = (e: E, data: T) => void | boolean;
export interface DndSourceItem {
  width: number;
  height: number;
  x: number;
  y: number;
  node: HTMLElement;
  dragType?: DragTypes;
  path: string
}

export interface DndProps {
  children: any;
  className?: string;
  style?: CSSProperties;
  onDragStart?: (params: SourceParams) => void | boolean;
  onDrag?: DragMoveHandle;
  onDragEnd?: DragMoveHandle;
  onMoveIn?: DragMoveHandle;
  onMoveInEnd?: DragMoveHandle;
  dragAxis?: string[];
  path?: string
}

// 给指定路径设置值并返回结果
// export const setPathData = (treeData: any, pathStr: string, data: any) => {

// };

export default function BuildDndSortable() {
  let subscriptions: listenEvent[] = [];
  // 所有可拖拽的节点map
  const dndItemMap: Map<HTMLElement, TargetParams> = new Map()

  // 订阅跨域事件
  const subscribe: SubscribeHandle = (target, addEvent) => {
    subscriptions.push({
      // 只有跨域才会被触发
      listener: function (listenParams) {
        addEvent(listenParams);
        return target;
      },
      target: target
    });
  }

  const unsubscribe = (node?: HTMLElement | null) => {
    subscriptions = subscriptions.filter((sub) => sub.target.node !== node);
  };

  // 触发跨域事件
  const notifyEvent: NotifyEventHandle = (dndPrams) => {
    let result;
    const { target, source, e } = dndPrams;
    if (!target) return;
    const targetPathArr = target?.path?.split('.');
    targetPathArr?.pop();
    const targetParentPath = targetPathArr.join('.');
    for (let i = 0; i < subscriptions?.length; i++) {
      const option = subscriptions[i];
      const optionTarget = option.target;
      const optionTargetNode = optionTarget.node;
      if (target?.node === optionTargetNode || targetParentPath === optionTarget.path) {
        const fn = option?.listener;
        const params = {
          e,
          source: { ...source },
          target: option.target
        };
        const targetOption = fn(params);
        if (targetOption) {
          result = targetOption;
        }
      }
    }
    return result;
  }

  // 距离事件对象最近的目标
  const findNearest = (params: SourceParams) => {
    let addChilds = [];
    let addDistance = [];
    const { e, source } = params;
    const sourceNode = source?.node;
    const eventXY = getEventPosition(e);
    for (let child of dndItemMap.values()) {
      const childNode = child?.node;
      const other = getInsidePosition(childNode);
      // 碰撞目标(排除拖拽源及拖拽源的子元素)
      if (other && eventXY && isMoveIn(eventXY, other) && sourceNode !== childNode && !sourceNode?.contains(childNode)) {
        addDistance.push(getMinDistance(eventXY, other));
        addChilds.push(child);
      }
    }
    let minNum = Number.MAX_VALUE;
    let minChild;
    for (let i = 0; i < addDistance.length; i++) {
      if (addDistance[i] < minNum) {
        minNum = addDistance[i];
        minChild = addChilds[i];
      } else if (addDistance[i] == minNum && minChild?.node?.contains(addChilds[i]?.node)) {
        minNum = addDistance[i];
        minChild = addChilds[i];
      }
    }
    return minChild;
  }

  // 添加可拖拽子元素
  const setDndItemsMap = (item: TargetParams) => {
    dndItemMap.set(item.node, item);
  }

  // 提供拖拽和放置的组件
  const DndCore = React.forwardRef<any, DndProps>((props, ref) => {

    const {
      children,
      className,
      style,
      dragAxis = DragAxisCode,
      onDragStart,
      onDrag,
      onDragEnd,
      onMoveIn,
      onMoveInEnd,
      path,
      ...option
    } = props;

    const [dragType, setDragType] = useState<DragTypes>();
    const [hoverItem, setHoverItem] = useState<TargetParams>();
    const { contextDragStart, contextDrag, contextDragEnd, contextHoverItem } = useContext(DndChildrenContext);
    const nodeRef = useRef<any>();
    const fixedRoot = useRef<any>();
    const lastZIndexRef = useRef<string>('');
    const lastX = useRef<number>(0);
    const lastY = useRef<number>(0);
    const currentPath = path;

    useImperativeHandle(ref, () => ({
      node: nodeRef?.current
    }));

    // 监听区域的移入事件(具有跨域函数的, 且有path标志的可以订阅区域移入监听)
    useEffect(() => {
      const currentNode = nodeRef.current;
      if (currentNode && currentPath && (onMoveIn || onMoveInEnd)) {
        subscribe({
          node: currentNode,
          path: currentPath
        }, AddEvent, removeEvent);
      }
      return () => {
        unsubscribe(currentNode)
      }
    }, [currentPath]);

    // 记录所有被sortable包裹的元素
    useEffect(() => {
      const currentNode = nodeRef.current;
      if (currentPath !== undefined && currentNode !== null) {
        setDndItemsMap({ node: currentNode, path: currentPath });
      }
    }, [currentPath]);

    const setFixedStyle = (style: CSSProperties) => {
      setStyle({
        ...style,
      }, fixedRoot.current);
    }

    // 区域移入触发事件
    const AddEvent: listenEvent['listener'] = (listenParams) => {
      const { target, source } = listenParams;
      const sourcePathArr = source?.path?.split('.');
      sourcePathArr.pop()
      const sourceParentPath = sourcePathArr.join('.');
      const targetPathArr = target?.path?.split('.');
      targetPathArr.pop()
      const targetParentPath = targetPathArr.join('.');
      // 父级区域不能相同
      if (sourceParentPath == targetParentPath || sourceParentPath === target.path) return;
      if (source?.dragType === DragTypes.draging) {
        setHoverItem(target);
        onMoveIn && onMoveIn(listenParams);
      } else {
        setHoverItem(undefined);
        onMoveInEnd && onMoveInEnd(listenParams);
      }
    }

    const removeEvent = (listenParams: ListenParams) => {

    }

    // 可以拖拽
    const canDrag = () => {
      return DragAxisCode?.some((axis) => dragAxis?.includes(axis)) && currentPath !== undefined;
    };

    // 当前元素的拖拽事件
    const onDragStartHandle: DragEventHandler = (e, data) => {
      const node = data?.node;
      const offsetWH = getOffsetWH(node);
      const clientXY = getClientXY(node)
      if (!data || !offsetWH || !clientXY || !currentPath) return false;
      setDragType(DragTypes.dragStart);
      lastZIndexRef.current = data?.node?.style?.zIndex;
      lastX.current = clientXY?.x;
      lastY.current = clientXY?.y;
      setFixedStyle({
        boxSizing: 'border-box',
        height: `${offsetWH?.height}px`,
        width: `${offsetWH?.width}px`,
        left: `${lastX.current}px`,
        top: `${lastY.current}px`,
        pointerEvents: 'none',
        position: 'fixed',
        opacity: '0.8',
        zIndex: 999
      })
      const params = {
        node: node,
        dragType: DragTypes.dragStart,
        path: currentPath,
        x: data?.x as number,
        y: data?.y as number,
        width: offsetWH?.width,
        height: offsetWH?.height
      }
      if (contextDragStart) {
        contextDragStart(e, params);
      }
    };

    // 当前元素的拖拽事件
    const onDragHandle: DragEventHandler = (e, data) => {
      const node = data?.node;
      const offsetWH = getOffsetWH(node);
      if (!data || !offsetWH || !currentPath) return false;
      setDragType(DragTypes.draging);
      if (node?.style?.zIndex !== '999') {
        node.style.zIndex = '999';
      }
      const nowX = lastX.current + data?.deltaX;
      const nowY = lastY.current + data?.deltaY;
      setFixedStyle({
        boxSizing: 'border-box',
        height: `${offsetWH?.height}px`,
        width: `${offsetWH?.width}px`,
        left: `${nowX}px`,
        top: `${nowY}px`,
        pointerEvents: 'none',
        position: 'fixed',
        opacity: '0.8',
        zIndex: 999
      })
      lastX.current = nowX;
      lastY.current = nowY;
      const params = {
        node: node,
        dragType: DragTypes.draging,
        path: currentPath,
        x: data?.x as number,
        y: data?.y as number,
        width: offsetWH?.width,
        height: offsetWH?.height
      }
      if (contextDrag) {
        contextDrag(e, params);
      }
    };

    // 当前元素的拖拽事件
    const onDragStopHandle: DragEventHandler = (e, data) => {
      const node = data?.node;
      const offsetWH = getOffsetWH(node);
      if (!data || !offsetWH || !currentPath) return false;
      setDragType(DragTypes.dragEnd);
      node.style.zIndex = lastZIndexRef.current;
      const params = {
        node: node,
        dragType: DragTypes.dragEnd,
        path: currentPath,
        x: data?.x as number,
        y: data?.y as number,
        width: offsetWH?.width,
        height: offsetWH?.height
      }
      if (contextDragEnd) {
        contextDragEnd(e, params);
      }
    };

    // 当前元素的子元素的拖拽开始事件
    const handleItemDragStart: DndItemHandler = (e, data) => {
      const currentNode = nodeRef.current;
      if (!data || !currentNode) return false;
      const sourceParams = {
        e: e,
        source: data
      };
      onDragStart && onDragStart(sourceParams);
    }

    // 当前元素的子元素拖拽中
    const handleItemDrag: DndItemHandler = (e, data) => {
      const currentNode = nodeRef.current;
      if (!data || !currentNode) return false;
      const sourceParams = {
        e,
        source: data
      };
      const targetItem = findNearest(sourceParams);
      const result = {
        ...sourceParams,
        target: targetItem
      };
      // 触发
      if (notifyEvent) {
        const notifyResult = notifyEvent(result);
        // 同区域内拖拽
        if (!notifyResult || notifyResult.node === currentNode) {
          onDrag && onDrag(result);
        }
      }
      setHoverItem(targetItem);
    }

    // 当前元素的子元素拖拽结束
    const handleItemDragEnd: DndItemHandler = (e, data) => {
      const currentNode = nodeRef.current;
      if (!data || !currentNode) return false;
      const sourceParams = {
        e,
        source: data
      };
      const targetItem = findNearest(sourceParams);
      const result = {
        ...sourceParams,
        target: targetItem
      };
      // 触发
      if (notifyEvent) {
        const notifyResult = notifyEvent(result);
        // 同区域内拖拽
        if (!notifyResult || notifyResult.node === currentNode) {
          onDrag && onDrag(result);
        }
      }
      setHoverItem(undefined);
    }

    const cls = classNames((children?.props?.className || ''), className);
    const isHover = contextHoverItem && contextHoverItem?.node === nodeRef.current;
    const isDrag = dragType && [DragTypes.draging, DragTypes.dragStart]?.includes(dragType);

    const FixedDrag = (<Draggable
      {...option}
      ref={fixedRoot}
      style={style}
      className={cls}
      axis={dragAxis}
      disabled={!canDrag()}
      onDragStart={onDragStartHandle}
      onDrag={onDragHandle}
      onDragStop={onDragStopHandle}
    >
      <div>
        {children}
      </div>
    </Draggable>
    );

    const NormalDrag = (<Draggable
      {...option}
      ref={nodeRef}
      className={cls}
      axis={dragAxis}
      disabled={!canDrag()}
      onDragStart={onDragStartHandle}
      onDrag={onDragHandle}
      onDragStop={onDragStopHandle}
      fixed
      style={{
        ...style,
        opacity: isDrag ? '0' : (isHover ? '0.8' : style?.opacity)
      }}
    >
      <div>
        {children}
      </div>
    </Draggable>
    );

    // 可拖拽子元素
    const NormalItem = (
      <DndChildrenContext.Provider value={{
        contextHoverItem: hoverItem,
        contextDragStart: handleItemDragStart,
        contextDrag: handleItemDrag,
        contextDragEnd: handleItemDragEnd
      }}>
        {isDrag && FixedDrag}
        {NormalDrag}
      </DndChildrenContext.Provider>
    );

    return NormalItem;
  });

  return DndCore;
};