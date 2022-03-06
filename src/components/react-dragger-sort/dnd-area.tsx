import React from "react";
import {
  DndAreaProps,
  listenEvent,
  DragTypes,
  DndTargetItemType
} from "./utils/types";
import classNames from "classnames";
import { DndItemHandler, DndProps } from "./dnd-item";
import { DndProviderContext, DndAreaContext } from "./dnd-context";

// 拖拽区域组件
export default class DndArea extends React.Component<DndAreaProps, { targetItem?: DndTargetItemType }> {
  parent: HTMLElement | null;
  static Item: React.ForwardRefExoticComponent<DndProps & React.RefAttributes<any>>;
  constructor(props: DndAreaProps) {
    super(props);
    this.parent = null;
    this.state = {
    };
  }

  static contextType = DndProviderContext;

  componentDidMount() {
    // 初始化监听事件
    const area = this.parent;
    const { subscribe } = this.context?.store;
    if (subscribe && area) {
      subscribe({
        area,
        collect: this.props.collect
      }, this.AddEvent);
    }
  }

  componentWillUnmount() {
    const { unsubscribe } = this.context?.store;
    unsubscribe && unsubscribe(this.parent);
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
    const { store } = this.context;
    const { findNearest, notifyEvent, setHoverItem } = store;
    const targetItem = findNearest(data);
    setHoverItem(targetItem);
    // 触发
    if (notifyEvent) {
      const sourceParams = {
        e,
        source: {
          area: this.parent,
          item: data,
          collect: this.props.collect
        }
      };
      const subscribeTarget = notifyEvent(sourceParams);
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
    const { findNearest, notifyEvent, setHoverItem } = this.context?.store;
    const targetItem = findNearest(data);
    setHoverItem();
    // 触发
    if (notifyEvent) {
      const sourceParams = {
        e,
        source: {
          area: this.parent,
          item: data,
          collect: this.props.collect
        }
      };

      const subscribeTarget = notifyEvent(sourceParams);
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
    const { findNearest } = this.context?.store;
    const targetItem = findNearest(sourceItem);
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
      this.context?.onAreaDropping && this.context?.onAreaDropping(result);
    } else if (sourceItem?.dragType === DragTypes.dragEnd) {
      this.setState({
        targetItem: undefined
      });
      this.context.onAreaDropEnd && this.context.onAreaDropEnd(result);
    }
  }

  render() {
    const {
      className,
      style,
      children
    } = this.props;

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
          targetItem: this.state.targetItem
        }}>
          {children}
        </DndAreaContext.Provider>
      </div>
    );
  }
};
