import React from 'react';
import { matchParent, addEvent, removeEvent, getEventPosition, findElement, css, getClientXY, getWindow } from "@/utils/dom";
import { isMobile, isEventTouch } from "@/utils/verify";
import { DragDirection, DragDirectionCode, DragEventData, DraggableEventProps, EventType } from "./utils/types";
import { MouseButton } from '@/utils/mouse';
import { addUserSelectStyles, removeUserSelectStyles, snapToGrid } from './utils/utils';

// Simple abstraction for dragging events names.
const eventsFor = {
  touch: {
    start: 'touchstart',
    move: 'touchmove',
    stop: 'touchend'
  },
  mouse: {
    start: 'mousedown',
    move: 'mousemove',
    stop: 'mouseup'
  }
};

// 根据当前设备看是否触发
export const dragEventFor = isMobile() ? eventsFor.touch : eventsFor.mouse;

class DraggableEvent extends React.Component<DraggableEventProps> {
  dragging: boolean;
  eventData: DragEventData | {};
  child: any;
  handleRef: any;
  constructor(props: DraggableEventProps) {
    super(props);
    this.dragging = false;
    this.eventData = {};
    this.handleRef = React.createRef();
    this.state = {
    };
  }

  static defaultProps = {
    direction: DragDirectionCode,
    scale: 1
  }

  componentDidMount() {
    const node = this.findDOMNode();
    addEvent(node, dragEventFor.start, this.handleDragStart);
  }

  componentWillUnmount() {
    const node = this.findDOMNode();
    const ownerDocument = this.findOwnerDocument();
    const { enableUserSelectHack } = this.props
    removeEvent(node, dragEventFor.start, this.handleDragStart);
    removeEvent(ownerDocument, dragEventFor.move, this.handleDrag);
    removeEvent(ownerDocument, dragEventFor.stop, this.handleDragStop);
    // 移除选中样式
    if (enableUserSelectHack) removeUserSelectStyles(ownerDocument);
  }

  // 顶层document对象
  findOwnerDocument = () => {
    const node = this.findDOMNode();
    return node?.ownerDocument;
  };

  findDOMNode() {
    const { forwardedRef } = this.props;
    return forwardedRef?.current || this.handleRef.current;
  }

  // 拖拽句柄
  findHandle = () => {
    const child = this.findDOMNode();
    const { handle } = this.props;
    const win = getWindow();
    const childStyle = win?.getComputedStyle(child);
    const handleDom = handle ? findElement(handle, child) : child;
    if (childStyle?.display === "inline") {
      throw new Error("the style of `props.children` cannot is `inline`, because `transform` has no effect on Element ");
    }
    return handleDom;
  };

  // 过滤的句柄
  findFilterNode = () => {
    const child = this.findDOMNode();
    const { filter } = this.props;
    const node = filter && findElement(filter, child);
    return node;
  };

  // 获取定位父元素, 涉及的位置相对于该父元素
  getEventBounds = () => {
    const ownerDocument = this.findOwnerDocument();
    const { eventBounds } = this.props;
    const parent = findElement(eventBounds) || ownerDocument.body || ownerDocument.documentElement;
    return parent;
  }

  handleDragStart = (e: EventType) => {
    const handleDom = this.findHandle();
    const child = this.findDOMNode();
    const filterNode = this.findFilterNode();
    const ownerDocument = this.findOwnerDocument();
    const win = getWindow();
    const { allowAnyClick, disabled, enableUserSelectHack, onStart, } = this.props;
    const target = e.target;

    if (!ownerDocument) {
      throw new Error('<DraggableEvent> not mounted on DragStart!');
    }

    // allowAnyClick为false禁止非左键
    if (!allowAnyClick && !isEventTouch(e) && typeof (e as any).button === 'number' && (e as any).button !== MouseButton.left) return;

    // props控制是否拖拽
    if (
      !handleDom ||
      // 禁止拖拽
      disabled ||
      // 拖拽目标不存在
      (!(target instanceof win?.Node)) ||
      // handle不存在
      (handleDom && !matchParent(target, handleDom)) ||
      // 点击目标为过滤的元素
      (filterNode && target === filterNode) ||
      (!this.canDragX() && !this.canDragY())) {
      return;
    }

    // eventBounds内的位置
    const parent = this.getEventBounds();
    const eventXY = getEventPosition(e, parent);
    if (!eventXY) return;
    const eventX = eventXY?.x;
    const eventY = eventXY?.y;

    // 返回事件对象相关的位置信息
    const newEventData = {
      target: child,
      deltaX: 0,
      deltaY: 0,
      lastEventX: eventX,
      lastEventY: eventY,
      eventX: eventX,
      eventY: eventY
    };
    this.eventData = newEventData;
    // 如果没有完成渲染或者返回false则禁止拖拽
    onStart && onStart(e, newEventData);

    // 滚动过程中选中文本被添加样式
    if (enableUserSelectHack) addUserSelectStyles(ownerDocument);
    this.dragging = true;
    addEvent(ownerDocument, dragEventFor.move, this.handleDrag);
    addEvent(ownerDocument, dragEventFor.stop, this.handleDragStop);
  };

  handleDrag = (e: EventType) => {
    if (!this.dragging) return;
    // eventBounds内的位置
    const parent = this.getEventBounds();
    const child = this.findDOMNode();
    const eventXY = getEventPosition(e, parent);
    const { scale, grid, onMove, } = this.props;
    const eventData = this.eventData;
    const { lastEventX, lastEventY } = eventData as DragEventData;
    if (!eventXY || !scale) return;
    let eventX = eventXY?.x;
    let eventY = eventXY?.y;
    // 拖拽跳跃,可设置多少幅度跳跃一次
    if (Array.isArray(grid)) {
      let deltaX = eventX - lastEventX, deltaY = eventY - lastEventY;
      [deltaX, deltaY] = snapToGrid(grid, deltaX, deltaY);
      if (!deltaX && !deltaY) return; // skip useless drag
      eventX = lastEventX + deltaX, eventY = lastEventY + deltaY;
    }

    // 返回事件对象相关的位置信息
    const newEventData = {
      target: child,
      deltaX: this.canDragX() ? (eventX - lastEventX) / scale : 0,
      deltaY: this.canDragY() ? (eventY - lastEventY) / scale : 0,
      lastEventX: eventX,
      lastEventY: eventY,
      eventX: eventX,
      eventY: eventY
    }
    this.eventData = newEventData;
    onMove && onMove(e, newEventData);
  };

  handleDragStop = (e: EventType) => {
    const eventData = this.eventData as DragEventData;
    const dragging = this.dragging;
    const { enableUserSelectHack, onEnd } = this.props;
    if (!dragging || !eventData) return;
    const ownerDocument = this.findOwnerDocument();

    const newEventData = {
      ...eventData,
      deltaX: 0,
      deltaY: 0
    }
    this.eventData = newEventData;
    this.dragging = false;
    // 移除文本因滚动造成的显示
    if (ownerDocument) {
      // Remove user-select hack
      if (enableUserSelectHack) removeUserSelectStyles(ownerDocument);
    }

    if (ownerDocument) {
      removeEvent(ownerDocument, dragEventFor.move, this.handleDrag);
      removeEvent(ownerDocument, dragEventFor.stop, this.handleDragStop);
    }
    onEnd && onEnd(e, newEventData);
  };

  canDragX = () => {
    const { direction } = this.props;
    return direction?.includes(DragDirection.Horizontal);
  };

  canDragY = () => {
    const { direction } = this.props;
    return direction?.includes(DragDirection.Vertical);
  };

  render() {
    const {
      handle,
      filter,
      eventBounds,
      allowAnyClick,
      disabled,
      enableUserSelectHack,
      direction,
      scale,
      grid,
      onStart,
      onMove,
      onEnd,
      children,
      forwardedRef,
      style,
      ...rest
    } = this.props;
    const ref = forwardedRef ?? this.handleRef
    return React.cloneElement(React.Children.only(children), {
      ref: ref,
      style: { ...children.props.style, ...style },
      ...rest
    });
  }
}

const wrapper = function (InnerComponent: typeof DraggableEvent) {
  return React.forwardRef((props: DraggableEventProps, ref) => {
    return (
      <InnerComponent forwardedRef={ref} {...props} />
    )
  })
}

export default wrapper(DraggableEvent);
