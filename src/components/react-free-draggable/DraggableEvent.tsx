import React from 'react';
import { matchParent, addEvent, removeEvent, getEventPosition, findElement, css, getClientXY, getWindow } from "@/utils/dom";
import { isMobile, isEventTouch } from "@/utils/verify";
import { DragDirection, DragDirectionCode, DraggableEventProps, EventData, EventType } from "./utils/types";
import ReactDOM from 'react-dom';
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
  eventData: EventData | {};
  child: any;
  cloneLayer: any;
  initStyle: { width: string, height: string, left: number, top: number } | undefined
  moveStartFlag: boolean;
  constructor(props: DraggableEventProps) {
    super(props);
    this.dragging = false;
    this.moveStartFlag = true;
    this.eventData = {};
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
    return forwardedRef?.current || ReactDOM.findDOMNode(this);
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

  initLayerNode = () => {
    const { showLayer, layerStyle } = this.props;
    if (!showLayer) return;
    const node = this.findDOMNode();
    const ownerDocument = this.findOwnerDocument();
    const cloneLayer = node.cloneNode(true);
    this.cloneLayer = cloneLayer;
    const clientXY = getClientXY(node);
    const win = getWindow();
    const nodeStyle = win?.getComputedStyle(node);
    if (cloneLayer && clientXY) {
      css(cloneLayer, {
        width: nodeStyle.getPropertyValue('width'),
        height: nodeStyle.getPropertyValue('height'),
        left: clientXY?.x + 'px',
        top: clientXY?.y + 'px',
        position: 'fixed',
        zIndex: 999,
        transition: '',
        opacity: 0.6,
        margin: 0,
        ...layerStyle
      })
      this.initStyle = {
        width: nodeStyle.getPropertyValue('width'),
        height: nodeStyle.getPropertyValue('height'),
        left: clientXY?.x,
        top: clientXY?.y
      }
    }
    ownerDocument.body.appendChild(cloneLayer)
  }

  setLayerNode = (delta: { deltaX: number, deltaY: number }) => {
    const { showLayer } = this.props;
    const { deltaX, deltaY } = delta;
    const { initStyle, cloneLayer } = this;
    if (!showLayer) return;
    if (initStyle) {
      const newLeft = initStyle?.left + deltaX;
      const newTop = initStyle?.top + deltaY;
      css(cloneLayer, {
        ...initStyle,
        left: newLeft + 'px',
        top: newTop + 'px'
      })
      this.initStyle = {
        ...initStyle,
        left: newLeft,
        top: newTop
      }
    }
  }

  removeLayerNode = () => {
    const { showLayer } = this.props;
    if (!showLayer) return;
    const ownerDocument = this.findOwnerDocument();
    ownerDocument.body.removeChild(this.cloneLayer);
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
    const positionXY = getEventPosition(e, parent);
    if (!positionXY) return;
    const positionX = positionXY?.x;
    const positionY = positionXY?.y;

    // 返回事件对象相关的位置信息
    const newEventData = {
      node: child,
      deltaX: 0,
      deltaY: 0,
      lastEventX: positionX,
      lastEventY: positionY,
      eventX: positionX,
      eventY: positionY
    };
    this.eventData = newEventData;
    this.initLayerNode();
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
    const positionXY = getEventPosition(e, parent);
    const { scale, grid, onMoveStart, onMove, } = this.props;
    const eventData = this.eventData;
    const { lastEventX, lastEventY } = eventData as EventData;
    const moveStartFlag = this.moveStartFlag;
    if (!positionXY || !scale) return;
    let positionX = positionXY?.x;
    let positionY = positionXY?.y;
    // 拖拽跳跃,可设置多少幅度跳跃一次
    if (Array.isArray(grid)) {
      let deltaX = positionX - lastEventX, deltaY = positionY - lastEventY;
      [deltaX, deltaY] = snapToGrid(grid, deltaX, deltaY);
      if (!deltaX && !deltaY) return; // skip useless drag
      positionX = lastEventX + deltaX, positionY = lastEventY + deltaY;
    }

    // 返回事件对象相关的位置信息
    const newEventData = {
      node: child,
      deltaX: this.canDragX() ? (positionX - lastEventX) / scale : 0,
      deltaY: this.canDragY() ? (positionY - lastEventY) / scale : 0,
      lastEventX: positionX,
      lastEventY: positionY,
      eventX: positionX,
      eventY: positionY
    }
    this.eventData = newEventData
    this.setLayerNode({ deltaX: newEventData?.deltaX, deltaY: newEventData?.deltaY });

    if (moveStartFlag) {
      onMoveStart && onMoveStart(e, newEventData);
    }
    this.moveStartFlag = false
    onMove && onMove(e, newEventData);
  };

  handleDragStop = (e: EventType) => {
    const eventData = this.eventData as EventData;
    const dragging = this.dragging;
    const { enableUserSelectHack, onEnd } = this.props;
    if (!dragging || !eventData) return;
    const ownerDocument = this.findOwnerDocument();

    const newEventData = {
      ...eventData,
      deltaX: 0,
      deltaY: 0
    }
    this.eventData = newEventData
    // 重置
    this.removeLayerNode()
    this.moveStartFlag = true;
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
      showLayer,
      layerStyle,
      allowAnyClick,
      disabled,
      enableUserSelectHack,
      direction,
      scale,
      grid,
      onStart,
      onMoveStart,
      onMove,
      onEnd,
      children,
      forwardedRef,
      style,
      ...rest
    } = this.props;
    return React.cloneElement(React.Children.only(children), {
      ref: forwardedRef,
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