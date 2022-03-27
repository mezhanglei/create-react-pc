import React, { useEffect, useRef, useState, CSSProperties, useImperativeHandle } from 'react';
import { DragHandler as DragEventHandler, DragAxisCode, DraggableEvent } from "@/components/react-free-draggable";
import { TargetParams, DragTypes, listenEvent, NotifyEventHandle, SourceParams, SubscribeHandle, ActiveTypes, DndCallBackProps, DndParams } from "./utils/types";
import classNames from "classnames";
import { getClientXY, getEventPosition, getInsidePosition, getOffsetWH } from "@/utils/dom";
import { getMinDistance, isMoveIn } from './utils/dom';

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
  onDragStart?: DragMoveHandle;
  onDragMove?: DragMoveHandle;
  onDragMoveEnd?: DragMoveHandle;
  dragAxis?: string[];
  path?: string
}

export default function BuildDndSortable() {
  let subscriptions: listenEvent[] = [];
  // 所有可拖拽的节点map
  const dndItemMap: Map<string, TargetParams> = new Map()

  // 判断目标是否可以拖放
  const isCanDrop = (target: TargetParams) => {
    return target?.onAdd
  }

  // 获取目标路径的父元素路径
  const getParentPath = (pathStr: string) => {
    const pathArr = pathStr?.split('.');
    pathArr?.pop();
    return pathArr?.join('.');
  }

  // 选中触发
  const setActive = (target: TargetParams, dndParams: DndParams) => {
    const { node, onChoose } = target;
    // 触发函数
    if (node.dataset.active !== ActiveTypes.active) {
      node.dataset.active = ActiveTypes.active;
      console.log('choose:', target?.path)
      onChoose && onChoose(dndParams);
    }
  }

  // 移除触发
  const removeActive = (target: TargetParams, dndParams: DndParams) => {
    const { node, onUnchoose } = target;
    if (node.dataset.active === ActiveTypes.active) {
      console.log('unchoose:', target?.path)
      onUnchoose && onUnchoose(dndParams);
      node.dataset.active = ActiveTypes.notActive;
    }
  }

  // 订阅碰撞事件
  const subscribe: SubscribeHandle = (sortableItem) => {
    subscriptions.push({
      listener: function (dndParams) {
        const { target, source } = dndParams;
        // 碰撞进行中
        if (target && sortableItem.node === target?.node) {
          const sourceParentPath = getParentPath(source.path);
          const targetParentPath = getParentPath(target.path);
          // 设置选中状态
          setActive(target, dndParams);
          // 排除拖拽元素的自身的父元素
          if (target?.path === sourceParentPath) return;
          // 同域碰撞
          if (sourceParentPath == targetParentPath && !isCanDrop(target)) {
            if (source?.dragType === DragTypes.draging) {

            } else {
              target?.onUpdate && target?.onUpdate(dndParams);
            }
            // 跨域碰撞
          } else {
            // 跨域目标确认
            const closest = isCanDrop(target) ? target : dndItemMap.get(targetParentPath);
            if (source?.dragType === DragTypes.draging) {

            } else {
              closest?.onAdd && closest?.onAdd(dndParams);
            }
          }

          // 移除选中状态
          if (source?.dragType === DragTypes.dragEnd) {
            removeActive(target, dndParams)
          }
        } else {
          // 移出选中状态
          removeActive(sortableItem, dndParams);
        }
        return sortableItem;
      },
      sortableItem: sortableItem
    });
  }

  const unsubscribe = (node?: HTMLElement | null) => {
    subscriptions = subscriptions.filter((sub) => sub.sortableItem.node !== node);
  };

  // 触发所有订阅元素上的绑定事件
  const notifyEvent: NotifyEventHandle = (dndParams) => {
    let result;
    for (let i = 0; i < subscriptions?.length; i++) {
      const option = subscriptions[i];
      const fn = option?.listener;
      const targetOption = fn(dndParams);
      if (targetOption) {
        result = targetOption;
      }
    }
    return result;
  }

  // 距离事件对象最近的目标
  const findNearest = (params: SourceParams) => {
    let addChilds = [];
    let addDistance = [];
    const { e } = params;
    const eventXY = getEventPosition(e);
    for (let child of dndItemMap.values()) {
      const childNode = child?.node;
      const other = getInsidePosition(childNode);
      // 碰撞目标(排除拖拽源的后代子元素)
      if (other && eventXY && isMoveIn(eventXY, other)) {
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
    dndItemMap.set(item.path, item);
  }

  // 提供拖拽和放置的组件
  const DndCore = React.forwardRef<any, DndProps>((props, ref) => {

    const {
      children,
      className,
      style,
      dragAxis = DragAxisCode,
      onDragStart,
      onDragMove,
      onDragMoveEnd,
      onUpdate,
      onAdd,
      onChoose,
      onUnchoose,
      path,
      ...option
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
          onUpdate,
          onAdd,
          onChoose,
          onUnchoose
        }
        subscribe(data);
        setDndItemsMap(data);
      }
      return () => {
        unsubscribe(currentNode)
      }
    }, [currentPath]);

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
      const params = {
        node: node,
        dragType: DragTypes.dragStart,
        path: currentPath,
        x: data?.x as number,
        y: data?.y as number,
        width: offsetWH?.width,
        height: offsetWH?.height
      }
      onDragStart && onDragStart({ e, source: params })
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
      const targetItem = findNearest(sourceParams);
      onDragMove && onDragMove({ ...sourceParams, target: targetItem });
      notify(sourceParams, targetItem)
    };

    // 当前元素的拖拽事件
    const onDragStopHandle: DragEventHandler = (e, data) => {
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
      const targetItem = findNearest(sourceParams);
      onDragMoveEnd && onDragMoveEnd({ ...sourceParams, target: targetItem });
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
        notifyEvent(result)
      }
    }

    const cls = classNames((children?.props?.className || ''), className);
    const isDrag = dragType && [DragTypes.draging, DragTypes.dragStart]?.includes(dragType);

    return (
      <DraggableEvent
        {...option}
        ref={nodeRef}
        className={cls}
        axis={dragAxis}
        disabled={!canDrag()}
        onDragStart={onDragStartHandle}
        onDrag={onDragHandle}
        onDragStop={onDragStopHandle}
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