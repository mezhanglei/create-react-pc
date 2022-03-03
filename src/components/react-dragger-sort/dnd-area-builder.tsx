import React from "react";
import {
  DndAreaProps,
  DndAreaBuilder,
  listenEvent,
  DragTypes,
  DndAreaState,
  TriggerFuncHandle,
  SubscribeHandle,
  DndTargetItemType
} from "./utils/types";
import classNames from "classnames";
import { DndItemHandler, DndSourceItem } from "./dnd-item";
import { getInsidePosition } from "@/utils/dom";
import { getDistance, isOverLay } from "./utils/dom";
import { DndContext } from "./dnd-context";
import { DndAreaContext } from "./dnd-area-context";

// 拖拽容器构造函数
const buildDndArea: DndAreaBuilder = () => {

  let subscriptions: listenEvent[] = [];
  // 利用数组引用收集可以拖拽的子元素
  const dndItems: DndTargetItemType[] = [];
  // 订阅
  const subscribe: SubscribeHandle = (target, addEvent) => {
    subscriptions.push({
      listener: function (listenParams) {
        const { source } = listenParams;
        const targetArea = target.area;
        const sourceArea = source.area;
        const sourceItem = source.item;
        // 跨区域拖拽
        if (sourceArea !== targetArea) {
          const targetAreaRect = getInsidePosition(targetArea);
          const sourceAreaRect = getInsidePosition(sourceArea);
          if (!targetAreaRect || !sourceAreaRect) return;
          const move = {
            left: sourceItem?.x,
            top: sourceItem?.y,
            right: sourceItem?.x + sourceItem?.width,
            bottom: sourceItem?.y + sourceItem?.height
          };
          if (isOverLay(move, targetAreaRect)) {
            // 目标区域嵌套在外面
            if (targetArea.contains(sourceArea)) {
              if (!isOverLay(move, sourceAreaRect)) {
                addEvent(listenParams);
                return target;
              }
            }
            addEvent(listenParams);
            return target;
          }
        }
      },
      target: target
    });
  };
  // 卸载
  const unsubscribe = (area?: HTMLElement | null) => {
    subscriptions = subscriptions.filter((sub) => sub.target.area !== area);
  };
  // 触发
  const triggerFunc: TriggerFuncHandle = ({ source, e }) => {
    let result;
    subscriptions.forEach(option => {
      const fn = option?.listener;
      const params = {
        e,
        source: { ...source },
        target: option.target
      };
      const info = fn(params);
      if (info) {
        result = info;
      }
    });
    return result;
  };

  // 拖拽区域组件
  class DndArea extends React.Component<DndAreaProps, DndAreaState> {
    parent: HTMLElement | null;
    constructor(props: DndAreaProps) {
      super(props);
      this.parent = null;
      this.state = {
      };
    }

    static contextType = DndContext;

    componentDidMount() {
      // 初始化监听事件
      const area = this.parent;
      if (subscribe && area) {
        subscribe({
          area,
          collect: this.props.collect
        }, this.AddEvent);
      }
    }

    componentWillUnmount() {
      unsubscribe && unsubscribe(this.parent);
    }

    // 找出相遇点中最近的元素
    findNearest = (sourceItem: DndSourceItem) => {
      let addChilds = [];
      let addDistance = [];
      for (let i = 0; i < dndItems.length; i++) {
        const child = dndItems[i];
        const move = {
          left: sourceItem?.x,
          top: sourceItem?.y,
          right: sourceItem?.x + sourceItem?.width,
          bottom: sourceItem?.y + sourceItem?.height
        };
        const other = getInsidePosition(child?.node);
        if (other && isOverLay(move, other) && child.node !== sourceItem?.node) {
          addDistance.push(getDistance(move, other));
          addChilds.push(child);
        }
      }
      let minNum = Number.MAX_VALUE;
      let minChild;
      for (let i = 0; i < addDistance.length; i++) {
        if (addDistance[i] < minNum) {
          minNum = addDistance[i];
          minChild = addChilds[i];
        }
      }
      return minChild;
    }

    onDragStart: DndItemHandler = (e, data) => {
      if (!data || !this.parent) return false;
      const sourceParams = {
        e: e,
        source: {
          area: this.parent,
          item: data,
          collect: this.props.collect
        }
      };
      this.context?.onDragStart && this.context?.onDragStart(sourceParams);
    }

    onDrag: DndItemHandler = (e, data) => {
      if (!data || !this.parent) return false;
      const targetItem = this.findNearest(data);
      // 触发
      if (triggerFunc) {
        const sourceParams = {
          e,
          source: {
            area: this.parent,
            item: data,
            collect: this.props.collect
          }
        };
        const subscribeTarget = triggerFunc(sourceParams);
        // 同区域内拖拽回调
        if (!subscribeTarget) {
          const result = {
            ...sourceParams,
            target: {
              ...sourceParams['source'],
              item: targetItem
            }
          };
          this.context?.onDrag && this.context?.onDrag(result);
        }
      }
      this.setState({
        targetItem: targetItem
      });
    }

    onDragEnd: DndItemHandler = (e, data) => {
      if (!data || !this.parent) return false;
      const targetItem = this.findNearest(data);
      // 触发
      if (triggerFunc) {
        const sourceParams = {
          e,
          source: {
            area: this.parent,
            item: data,
            collect: this.props.collect
          }
        };

        const subscribeTarget = triggerFunc(sourceParams);
        // 同区域内拖拽
        if (!subscribeTarget) {
          const result = {
            ...sourceParams,
            target: {
              ...sourceParams['source'],
              item: targetItem
            }
          };
          this.context?.onDragEnd && this.context?.onDragEnd(result);
        }
      }
      this.setState({
        targetItem: undefined
      });
    }

    // 跨区域拖拽监听进入事件
    AddEvent: listenEvent['listener'] = (listenParams) => {
      const { source } = listenParams;
      if (!this.parent || !source) return;
      const sourceItem = source.item;
      const targetItem = this.findNearest(sourceItem);
      const result = {
        ...listenParams,
        target: {
          ...listenParams.target,
          item: targetItem,
          collect: this.props.collect
        }
      };
      if (sourceItem?.dragType === DragTypes.draging) {
        this.setState({
          targetItem
        });
        this.context?.onDrag && this.context?.onDrag(result);
      } else if (sourceItem?.dragType === DragTypes.dragEnd) {
        this.setState({
          targetItem: undefined
        });
        this.context.onDragEnd && this.context.onDragEnd(result);
      }
    }

    render() {
      const {
        className,
        style,
        children
      } = this.props;
      const { targetItem } = this.state;
      const cls = classNames('DraggerLayout', className);

      return (
        <div
          className={cls}
          ref={node => this.parent = node}
          style={{
            ...style,
            zIndex: 1
          }}
        >
          <DndAreaContext.Provider value={{
            onDragStart: this.onDragStart,
            onDrag: this.onDrag,
            onDragEnd: this.onDragEnd,
            dndItems: dndItems,
            targetItem: targetItem
          }}>
            {children}
          </DndAreaContext.Provider>
        </div>
      );
    }
  }

  return DndArea;
};
export default buildDndArea;
