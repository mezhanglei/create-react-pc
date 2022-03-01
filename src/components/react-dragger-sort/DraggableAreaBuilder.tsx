import React from "react";
import {
  DraggableAreaProps,
  DraggableAreaBuilder,
  DraggerContextInterface,
  MoveChild,
  listenEvent,
  DragTypes,
  DraggableAreaState,
} from "./utils/types";
import classNames from "classnames";
import { DraggerItemHandler } from "./dragger-item";
import { getInsidePosition } from "@/utils/dom";
import { getDistance, isOverLay } from "./utils/dom";

export const DraggerContext = React.createContext<DraggerContextInterface>({});

// 拖拽容器
const buildDraggableArea: DraggableAreaBuilder = (areaProps) => {

  const subscribe = areaProps?.subscribe;
  const unsubscribe = areaProps?.unsubscribe;
  const triggerFunc = areaProps?.triggerFunc;
  const draggerItems = areaProps?.draggerItems || [];
  // 拖拽区域
  class DraggableArea extends React.Component<DraggableAreaProps, DraggableAreaState> {
    parent: HTMLElement | null;
    constructor(props: DraggableAreaProps) {
      super(props);
      this.parent = null;
      this.state = {
      };
    }

    componentDidMount() {
      // 初始化监听事件
      const area = this.parent;
      if (subscribe && area) {
        subscribe(area, this.AddEvent);
      }
    }

    componentWillUnmount() {
      unsubscribe && unsubscribe(this.parent);
    }

    // 找出相遇点中最近的元素
    findNearest = (moveChild: MoveChild) => {
      let addChilds = [];
      let addDistance = [];
      for (let i = 0; i < draggerItems.length; i++) {
        const child = draggerItems[i];
        const move = {
          left: moveChild?.x,
          top: moveChild?.y,
          right: moveChild?.x + moveChild?.width,
          bottom: moveChild?.y + moveChild?.height
        };
        const other = getInsidePosition(child?.node);
        if (other && isOverLay(move, other) && child.node !== moveChild?.node) {
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

    onDragStart: DraggerItemHandler = (e, data) => {
      if (!data || !this.parent) return false;
      const moveChild = { ...data, area: this.parent };
      const params = {
        e: e,
        target: moveChild,
        area: this.parent,
      };
      this.props?.onDragMoveStart && this.props?.onDragMoveStart(params);
    }

    onDrag: DraggerItemHandler = (e, data) => {
      if (!data || !this.parent) return false;
      const moveChild = { ...data, area: this.parent };
      const collision = this.findNearest(moveChild);
      const params = {
        e,
        area: this.parent,
        target: moveChild,
        collision: collision
      };
      this.setState({
        collision
      });
      collision && this.props?.onDragMove && this.props?.onDragMove(params);
      // 是否拖到区域外部
      if (triggerFunc) {
        triggerFunc(moveChild, e);
      }
    }

    onDragEnd: DraggerItemHandler = (e, data) => {
      if (!data || !this.parent) return false;
      const moveChild = { ...data, area: this.parent };
      const collision = this.findNearest(moveChild);
      const params = {
        e,
        area: this.parent,
        target: moveChild,
        collision: collision
      };
      this.setState({
        collision: undefined
      });
      this.props?.onDragMoveEnd && this.props?.onDragMoveEnd(params);
      // 是否拖到区域外部
      if (triggerFunc) {
        const isTrigger = triggerFunc(moveChild, e);
        if (isTrigger) {
          const result = {
            e,
            area: this.parent,
            target: moveChild
          };
          this.props?.onMoveOutChange && this.props?.onMoveOutChange(result);
        }
      }
    }

    // 拖拽外部元素进入当前区域内的事件
    AddEvent: listenEvent['listener'] = (moveChild, e) => {
      if (!this.parent) return;
      const collision = this.findNearest(moveChild);
      if (moveChild?.dragType === DragTypes.draging) {
        this.setState({
          collision
        });
      } else if (moveChild?.dragType === DragTypes.dragEnd) {
        const params = {
          e,
          area: this.parent,
          target: moveChild,
          collision: collision
        };
        this.setState({
          collision: undefined
        });
        this.props.onMoveInChange && this.props.onMoveInChange(params);
      }
    }

    render() {
      const {
        className,
        style,
        children
      } = this.props;
      const { collision } = this.state;
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
          <DraggerContext.Provider value={{
            onDragStart: this.onDragStart,
            onDrag: this.onDrag,
            onDragEnd: this.onDragEnd,
            draggerItems: draggerItems,
            collision: collision
          }}>
            {children}
          </DraggerContext.Provider>
        </div>
      );
    }
  }

  return DraggableArea;
};
export default buildDraggableArea;
