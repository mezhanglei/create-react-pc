import React from 'react';
import { isMobile } from "@/utils/verify";
import { addEvent, removeEvent, getEventPosition, getOffsetWH } from "@/utils/dom";
import { EventType, EventHandler, Direction, DragResizeProps, DragResizeState, DirectionCode, LastStyle } from "./type";
import ReactDOM from 'react-dom';
import { mergeObject } from '@/utils/object';

// Simple abstraction for dragging events names.
const eventsFor = {
  touch: {
    start: 'touchstart',
    move: 'touchmove',
    stop: 'touchend',
    cancel: 'touchcancel'
  },
  mouse: {
    start: 'mousedown',
    move: 'mousemove',
    stop: 'mouseup',
    cancel: 'dragover'
  }
};

// 根据当前设备看是否触发
let dragEventFor = isMobile() ? eventsFor.touch : eventsFor.mouse;

class DragResize extends React.Component<DragResizeProps, DragResizeState> {
  dragging: boolean;
  lastStyle?: LastStyle;
  direction?: string;
  constructor(props: DragResizeProps) {
    super(props);
    this.dragging = false;
    this.state = {
    };
  }
  static defaultProps = {
    offset: 10,
    axis: DirectionCode
  }

  componentDidUpdate(prevProps: DragResizeProps, prevState: DragResizeState) {
    const widthChanged = this.props.width !== prevProps.width;
    const heightChanged = this.props.height !== prevProps.height;
    if (widthChanged || heightChanged) {
      if (!this.dragging) {
        this.setState({
          nowStyle: mergeObject(this.state.nowStyle, {
            width: this.props?.width,
            height: this.props?.height
          })
        })
      }
    }
  }

  static getDerivedStateFromProps(nextProps: DragResizeProps, prevState: DragResizeState) {
    const widthChanged = nextProps.width !== prevState.prevWidth;
    const heightChanged = nextProps.height !== prevState.prevHeight;
    if (widthChanged) {
      return {
        ...prevState,
        prevWidth: nextProps.width,
      };
    }

    if (heightChanged) {
      return {
        ...prevState,
        prevHeight: nextProps.height,
      };
    }
    return null;
  }

  componentDidMount() {
    const node = this.findDOMNode();
    const computedWH = this.getStyleWH();
    if (computedWH) {
      this.setState({
        nowStyle: {
          width: this.props?.width ?? computedWH.width,
          height: this.props?.height ?? computedWH.height
        }
      });
    }

    addEvent(node, dragEventFor.start, this.onResizeStart);
    addEvent(node, dragEventFor.move, this.mouseOver);
  }

  componentWillUnmount() {
    const node = this.findDOMNode();
    removeEvent(node, dragEventFor.start, this.onResizeStart);
    removeEvent(node, dragEventFor.move, this.mouseOver);
    this.removeEvents();
  }

  findDOMNode() {
    return this.props?.forwardedRef?.current || ReactDOM.findDOMNode(this);
  }

  getStyleWH = () => {
    const node = this.findDOMNode();
    const computedStyle = getComputedStyle(node);
    const width = computedStyle.getPropertyValue('width').split('px')?.[0]
    const height = computedStyle.getPropertyValue('height').split('px')?.[0]
    if (width !== undefined && height !== undefined) {
      return { width: parseFloat(width), height: parseFloat(height) };
    };
  }

  // 顶层document对象（有的环境可能删除了document顶层环境）
  findOwnerDocument = (): Document => {
    const node = this.findDOMNode();
    const nodeStyle = node?.ownerDocument?.defaultView?.getComputedStyle(node);
    if (nodeStyle?.display === "inline") {
      throw new Error("the style of `props.children` cannot is `inline`!");
    }
    return node?.ownerDocument;
  };

  // 监听事件
  addEvents = () => {
    const ownerDocument = this.findOwnerDocument();
    addEvent(ownerDocument, dragEventFor.move, this.onMove);
    addEvent(ownerDocument, dragEventFor.stop, this.onResizeEnd);
    addEvent(ownerDocument, dragEventFor.cancel, this.onResizeEnd);
  }

  // 移除事件
  removeEvents = () => {
    const ownerDocument = this.findOwnerDocument();
    removeEvent(ownerDocument, dragEventFor.move, this.onMove);
    removeEvent(ownerDocument, dragEventFor.stop, this.onResizeEnd);
    removeEvent(ownerDocument, dragEventFor.cancel, this.onResizeEnd);
  }

  // 返回鼠标所在的边
  getDirection = (e: EventType) => {
    const element = this.findDOMNode();
    const position = getEventPosition(e, element);
    const offsetWH = getOffsetWH(element);
    const {
      offset
    } = this.props;
    if (!position || !offsetWH) return '';
    const distance = offset;
    const { x, y } = position;
    let direction = '';
    // 上边
    if (y < distance && y > -distance) direction += Direction.N;
    // 下边
    else if (y > offsetWH?.height - distance && y < offsetWH?.height + distance) direction += Direction.S;
    // 左边
    if (x < distance && x > -distance) direction += Direction.W;
    // 右边
    else if (x > offsetWH?.width - distance && x < offsetWH?.width + distance) direction += Direction.E;

    return direction;
  };

  // 返回鼠标的样式
  getMouseCursor = (direction: string): string => {
    const {
      axis
    } = this.props;
    if (([Direction.N, Direction.S] as string[])?.includes(direction) && (axis?.includes(Direction.N) || axis?.includes(Direction.S))) {
      return 'row-resize';
    } else if (([Direction.W, Direction.E] as string[])?.includes(direction) && (axis?.includes(Direction.W) || axis?.includes(Direction.E))) {
      return 'col-resize';
    } else if (direction?.length === 2 && (axis?.includes(Direction.NE) || axis?.includes(Direction.NW) || axis?.includes(Direction.SE) || axis?.includes(Direction.SW))) {
      return direction + '-resize';
    } else {
      return 'default';
    }
  }

  canDragX = (dir: string): boolean => {
    const {
      axis
    } = this.props;
    const canUse = axis?.includes(Direction.W) || axis?.includes(Direction.E) || axis?.includes(Direction.NW) || axis?.includes(Direction.NE) || axis?.includes(Direction.SW) || axis?.includes(Direction.SE);
    return canUse && (dir.indexOf(Direction.W) > -1 || dir.indexOf(Direction.E) > -1);
  };

  canDragY = (dir: string): boolean => {
    const {
      axis
    } = this.props;
    const canUse = axis?.includes(Direction.S) || axis?.includes(Direction.N) || axis?.includes(Direction.NW) || axis?.includes(Direction.NE) || axis?.includes(Direction.SW) || axis?.includes(Direction.SE);
    return canUse && (dir.indexOf(Direction.S) > -1 || dir.indexOf(Direction.N) > -1);
  };

  mouseOver: EventHandler = (e) => {
    const element = this.findDOMNode();
    const direction = this.getDirection(e);
    const mouseCursor = this.getMouseCursor(direction);
    element.style.cursor = mouseCursor;
  }

  onResizeStart: EventHandler = (e) => {
    const {
      forbid
    } = this.props;
    if (forbid) return;
    const direction = this.getDirection(e);
    this.direction = direction;
    this.dragging = true;
    const mouseCursor = this.getMouseCursor(direction);
    if (mouseCursor === 'default') {
      return;
    } else {
      e.stopImmediatePropagation();
    };
    e.preventDefault();
    const element = this.findDOMNode();
    const position = getEventPosition(e, element);
    const styleWH = this.getStyleWH();
    if (!position || !styleWH) return;

    this.props?.onResizeStart && this.props?.onResizeStart(e, {
      node: element,
      dir: direction,
      width: styleWH?.width,
      height: styleWH?.height
    });

    this.setState({
      nowStyle: {
        width: styleWH?.width,
        height: styleWH?.height
      }
    });

    this.lastStyle = {
      width: styleWH?.width,
      height: styleWH?.height,
      eventX: position?.x,
      eventY: position?.y,
    }
    this.addEvents();
  }

  onMove: EventHandler = (e) => {
    const {
      forbid
    } = this.props;
    if (forbid) return;
    e.preventDefault();
    const element = this.findDOMNode();
    if (!this.dragging) return;
    const position = getEventPosition(e, element);
    const styleWH = this.getStyleWH();
    const dir = this.direction;
    const lastEventX = this.lastStyle?.eventX;
    const lastEventY = this.lastStyle?.eventY;
    const lastW = this.lastStyle?.width;
    const lastH = this.lastStyle?.height;
    if (!position || !styleWH || !dir || lastW === undefined || lastH === undefined || lastEventX === undefined || lastEventY === undefined) return;

    let deltaX, deltaY;
    deltaX = position?.x - lastEventX;
    deltaY = position?.y - lastEventY;

    const nowW = this.canDragX(dir) ? (lastW + deltaX) : lastW;
    const nowH = this.canDragY(dir) ? (lastH + deltaY) : lastH;

    this.props?.onResizeMoving && this.props?.onResizeMoving(e, {
      node: element,
      dir: dir,
      width: nowW,
      height: nowH
    });
    this.setState({
      nowStyle: {
        ...this.state.nowStyle,
        width: nowW,
        height: nowH
      }
    });
  }

  onResizeEnd: EventHandler = (e) => {
    const {
      forbid
    } = this.props;
    if (forbid) return;
    e.preventDefault();
    if (!this.dragging || !this.state.nowStyle) return;

    const element = this.findDOMNode();
    this.props.onResizeEnd && this.props.onResizeEnd(e, {
      ...this.state.nowStyle,
      node: element,
      dir: this.direction as string
    });
    this.dragging = false;
    this.removeEvents();
  }

  render() {
    const {
      children,
      forwardedRef,
      className,
      style
    } = this.props;

    const {
      nowStyle
    } = this.state;

    return React.cloneElement(React.Children.only(children), {
      className: className ?? children.props?.className,
      ref: forwardedRef,
      style: {
        ...children.props?.style,
        ...style,
        ...nowStyle
      }
    });
  }
}

const wrapper = function (InnerComponent: any): any {
  return React.forwardRef((props, ref) => {
    return (
      <InnerComponent forwardedRef={ref} {...props} />
    )
  })
}

export default wrapper(DragResize)