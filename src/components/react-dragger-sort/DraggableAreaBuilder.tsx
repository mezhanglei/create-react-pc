import React from "react";
import {
  DraggableAreaProps,
  DraggableAreaBuilder,
  DraggerContextInterface,
  TagInterface,
  listenEvent,
  DragTypes,
  ChildTypes,
  DraggableAreaState,
} from "./utils/types";
import classNames from "classnames";
import { DraggerItemHandler } from "./dragger-item";
import { getOffsetWH, getInsidePosition } from "@/utils/dom";
import { throttle } from "@/utils/common";
import { isOverLay } from "./utils/dom";

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
    cacheCoverChild?: ChildTypes;
    cacheCrossCoverChild?: ChildTypes;
    throttleFn: Function;
    constructor(props: DraggableAreaProps) {
      super(props);
      this.parent = null;
      this.throttleFn = throttle((fn: any, ...args: any[]) => fn(...args), 16.7)
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

    //求两点之间的距离
    getDistance(obj1, obj2) {
      let a = (obj1.offsetLeft + obj1.offsetWidth / 2) - (obj2.offsetLeft + obj2.offsetWidth / 2)
      let b = (obj1.offsetTop + obj1.offsetHeight / 2) - (obj2.offsetTop + obj2.offsetHeight / 2)
      return Math.sqrt(a * a + b * b)
    }

    //碰撞检测
    isButt(obj1, obj2) {
      let l1 = obj1.offsetLeft
      let t1 = obj1.offsetTop
      let r1 = obj1.offsetLeft + obj1.offsetWidth
      let b1 = obj1.offsetTop + obj1.offsetHeight

      let l2 = obj2.offsetLeft
      let t2 = obj2.offsetTop
      let r2 = obj2.offsetLeft + obj2.offsetWidth
      let b2 = obj2.offsetTop + obj2.offsetHeight

      return !(r1 < l2 || b1 < t2 || r2 < l1 || b2 < t1)
    }

    //找出相遇点中最近的元素
    findNearest = (tag: TagInterface) => {
      let filterLi = []
      let aDistance = []
      const tagNode = tag?.node;
      const childs = draggerItems?.map((item) => item?.node);
      for (let i = 0; i < draggerItems.length; i++) {
        childs[i] != tagNode && (this.isButt(tagNode, draggerItems[i]) && (aDistance.push(this.getDistance(tagNode, draggerItems[i])), filterLi.push(childs[i])))
      }
      let minNum = Number.MAX_VALUE
      let minLi = null
      for (let i = 0; i < aDistance.length; i++) aDistance[i] < minNum && (minNum = aDistance[i], minLi = filterLi[i])
      return minLi
    }

    // 同区域内拖拽返回覆盖目标
    moveTrigger = (tag: TagInterface): ChildTypes | undefined => {
      if (!this.parent) return;
      const target = this.findNearest(tag);
      console.log(target, 2222)
      this.throttleFn(() => {
        // 判断是不是区域内 
        const parent = document?.body;
        const areaRect = this.parent && getInsidePosition(this.parent, parent);
        const x = tag?.x || 0;
        const y = tag?.y || 0;
        if (areaRect && x > areaRect?.left && x < areaRect?.right && y > areaRect?.top && y < areaRect?.bottom) {
          for (let i = 0; i < draggerItems?.length; i++) {
            const child = draggerItems[i];
            const position = getInsidePosition(child?.node);
            const offsetWH = getOffsetWH(child?.node);
            const item = {
              width: offsetWH?.width || 0,
              height: offsetWH?.height || 0,
              x: position?.left || 0,
              y: position?.top || 0
            }
            if (isOverLay(tag, item) && child.node !== tag?.node) {
              this.cacheCoverChild = child;
              break;
            }
          }
        } else {
          this.cacheCoverChild = undefined;
        }
      });
      return this.cacheCoverChild;
    }

    // 跨区域拖拽返回覆盖目标
    crossTrigger = (tag: TagInterface): ChildTypes | undefined => {
      this.throttleFn(() => {
        for (let i = 0; i < draggerItems?.length; i++) {
          const child = draggerItems[i];
          const position = getInsidePosition(child?.node);
          const offsetWH = getOffsetWH(child?.node);
          const item = {
            width: offsetWH?.width || 0,
            height: offsetWH?.height || 0,
            x: position?.left || 0,
            y: position?.top || 0
          }
          if (isOverLay(tag, item)) {
            this.cacheCrossCoverChild = child;
            break;
          }
        }
      });
      return this.cacheCrossCoverChild;
    }

    onDrag: DraggerItemHandler = (e, tag) => {
      if (!tag || !this.parent) return false;
      const areaTag = { ...tag, area: this.parent }
      const coverChild = this.moveTrigger(areaTag);
      this.setState({
        coverChild
      })
      coverChild && this.props?.onDragMove && this.props?.onDragMove(areaTag, coverChild, e);
      // 是否拖到区域外部
      if (triggerFunc) {
        triggerFunc(areaTag, e);
      }
    }

    onDragEnd: DraggerItemHandler = (e, tag) => {
      if (!tag || !this.parent) return false;
      const areaTag = { ...tag, area: this.parent }
      const coverChild = this.moveTrigger(areaTag);
      this.setState({
        coverChild: undefined
      });
      this.cacheCoverChild = undefined;
      this.props?.onDragMoveEnd && this.props?.onDragMoveEnd(areaTag, coverChild, e);
      // 是否拖到区域外部
      if (triggerFunc) {
        const isTrigger = triggerFunc(areaTag, e);
        if (isTrigger) {
          const triggerInfo = {
            area: this.parent,
            moveTag: areaTag
          }
          this.props?.onMoveOutChange && this.props?.onMoveOutChange(triggerInfo);
        }
      }
    }

    // 拖拽外部元素进入当前区域内的事件
    AddEvent: listenEvent['listener'] = (tag, e) => {
      if (!this.parent) return;
      const coverChild = this.crossTrigger(tag);
      if (tag?.dragType === DragTypes.draging) {
        this.setState({
          coverChild
        })
      } else if (tag?.dragType === DragTypes.dragEnd) {
        this.setState({
          coverChild: undefined
        })
        this.cacheCrossCoverChild = undefined;
        const triggerInfo = {
          area: this.parent,
          moveTag: tag,
          coverChild: coverChild
        }
        this.props.onMoveInChange && this.props.onMoveInChange(triggerInfo);
      }
    }

    render() {
      const {
        className,
        style,
        children
      } = this.props;
      const {
        coverChild
      } = this.state;
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
            onDrag: this.onDrag,
            onDragEnd: this.onDragEnd,
            draggerItems: draggerItems,
            coverChild: coverChild,
            zIndexRange: [2, 10]
          }}>
            {children}
          </DraggerContext.Provider>
        </div>
      );
    }
  }

  return DraggableArea;
}
export default buildDraggableArea