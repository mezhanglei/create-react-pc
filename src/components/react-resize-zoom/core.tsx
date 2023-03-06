import React from 'react';
import { isMobile } from "@/utils/brower";
import { addEvent, removeEvent, getEventPosition, getOffsetWH } from "./utils/dom";
import { EventType, EventHandler, ResizeDirection, DragResizeProps, DragResizeState, ResizeDirectionCode, LastStyle, ResizeDragTypes, NowStyle } from "./type";
import { getWindow } from '@/utils/dom';

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
let dragEventFor = isMobile() ? eventsFor.touch : eventsFor.mouse;

class DragResize extends React.Component<DragResizeProps, DragResizeState> {
  lastStyle?: LastStyle;
  dir?: string;
  dragType?: ResizeDragTypes;
  isUninstall?: boolean;
  handleRef: any;
  constructor(props: DragResizeProps) {
    super(props);
    this.handleRef = React.createRef();
    this.state = {
    };
  }
  static defaultProps = {
    offset: 10,
    direction: ResizeDirectionCode
  }

  componentDidMount() {
    const node = this.findDOMNode();
    const computedWH = this.getStyleWH();
    if (computedWH) {
      this.setStyle({ width: computedWH?.width, height: computedWH?.height }, this.props.width, this.props?.height)
    }

    addEvent(node, dragEventFor.start, this.onResizeStart);
    addEvent(node, dragEventFor.move, this.mouseOver);
  }

  // 非拖拽元素设置宽高
  setStyle = (oldStyle: NowStyle, newWidth?: number, newHeight?: number) => {
    if (typeof newWidth !== 'number' || typeof newHeight !== 'number') return
    const newStyle = {
      ...oldStyle,
      width: newWidth,
      height: newHeight
    }
    this.setState({
      nowStyle: newStyle
    });
    // 设置完translate初始化dragType
    this.dragType = undefined;
    return newStyle;
  }

  // 仅仅当为受控组件，且非拖拽的组件，设置值
  componentDidUpdate(prevProps: DragResizeProps, prevState: DragResizeState) {
    const widthChanged = this.props.width !== undefined && this.props.width !== prevProps.width;
    const heightChanged = this.props.height !== undefined && this.props.height !== prevProps.height;
    if (widthChanged || heightChanged) {
      if (!this.dragType && prevState?.nowStyle) {
        this.setStyle(prevState?.nowStyle, this.props?.width, this.props?.height)
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

  componentWillUnmount() {
    this.isUninstall = true;
    const node = this.findDOMNode();
    removeEvent(node, dragEventFor.start, this.onResizeStart);
    removeEvent(node, dragEventFor.move, this.mouseOver);
    this.removeEvents();
  }

  findDOMNode() {
    return this.props?.forwardedRef?.current || this.handleRef?.current;
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
    const win = getWindow();
    const nodeStyle = win?.getComputedStyle(node);
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
  }

  // 移除事件
  removeEvents = () => {
    const ownerDocument = this.findOwnerDocument();
    removeEvent(ownerDocument, dragEventFor.move, this.onMove);
    removeEvent(ownerDocument, dragEventFor.stop, this.onResizeEnd);
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
    const distance = offset as number;
    const { x, y } = position;
    let dir = '';
    // 上边
    if (y < distance && y > -distance) dir += ResizeDirection.N;
    // 下边
    else if (y > offsetWH?.height - distance && y < offsetWH?.height + distance) dir += ResizeDirection.S;
    // 左边
    if (x < distance && x > -distance) dir += ResizeDirection.W;
    // 右边
    else if (x > offsetWH?.width - distance && x < offsetWH?.width + distance) dir += ResizeDirection.E;

    return dir;
  };

  // 返回鼠标的样式
  getMouseCursor = (dir: string): string => {
    const {
      direction
    } = this.props;
    if (([ResizeDirection.N, ResizeDirection.S] as string[])?.includes(dir) && (direction?.includes(ResizeDirection.N) || direction?.includes(ResizeDirection.S))) {
      return 'row-resize';
    } else if (([ResizeDirection.W, ResizeDirection.E] as string[])?.includes(dir) && (direction?.includes(ResizeDirection.W) || direction?.includes(ResizeDirection.E))) {
      return 'col-resize';
    } else if (dir?.length === 2 && (direction?.includes(ResizeDirection.NE) || direction?.includes(ResizeDirection.NW) || direction?.includes(ResizeDirection.SE) || direction?.includes(ResizeDirection.SW))) {
      return dir + '-resize';
    } else {
      return 'default';
    }
  }

  canDragX = (dir: string) => {
    const {
      direction
    } = this.props;
    const canUse = direction?.includes(ResizeDirection.W) || direction?.includes(ResizeDirection.E) || direction?.includes(ResizeDirection.NW) || direction?.includes(ResizeDirection.NE) || direction?.includes(ResizeDirection.SW) || direction?.includes(ResizeDirection.SE);
    return canUse && (dir.indexOf(ResizeDirection.W) > -1 || dir.indexOf(ResizeDirection.E) > -1);
  };

  canDragY = (dir: string) => {
    const {
      direction
    } = this.props;
    const canUse = direction?.includes(ResizeDirection.S) || direction?.includes(ResizeDirection.N) || direction?.includes(ResizeDirection.NW) || direction?.includes(ResizeDirection.NE) || direction?.includes(ResizeDirection.SW) || direction?.includes(ResizeDirection.SE);
    return canUse && (dir.indexOf(ResizeDirection.S) > -1 || dir.indexOf(ResizeDirection.N) > -1);
  };

  mouseOver: EventHandler = (e) => {
    const element = this.findDOMNode();
    const dir = this.getDirection(e);
    const mouseCursor = this.getMouseCursor(dir);
    element.style.cursor = mouseCursor;
  }

  onResizeStart: EventHandler = (e) => {
    e.preventDefault();
    const {
      forbid
    } = this.props;
    if (forbid) return;
    this.dragType = ResizeDragTypes.ResizeStart;
    const dir = this.getDirection(e);
    const mouseCursor = this.getMouseCursor(dir);
    if (mouseCursor === 'default') {
      return;
    } else {
      e.stopImmediatePropagation();
    };
    this.dir = dir;
    const element = this.findDOMNode();
    const position = getEventPosition(e, element);
    const styleWH = this.getStyleWH();
    if (!position || !styleWH) return;

    this.props?.onResizeStart && this.props?.onResizeStart(e, {
      node: element,
      dir: dir,
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
    const dragType = this.dragType;
    if (!dragType) return;
    this.dragType = ResizeDragTypes.Resizing;
    const position = getEventPosition(e, element);
    const dir = this.dir;
    const lastEventX = this.lastStyle?.eventX;
    const lastEventY = this.lastStyle?.eventY;
    const lastW = this.lastStyle?.width;
    const lastH = this.lastStyle?.height;
    if (!position || !dir || lastW === undefined || lastH === undefined || lastEventX === undefined || lastEventY === undefined) return;

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
    const dragType = this.dragType;
    const { nowStyle } = this.state;
    if (!dragType || !nowStyle || !this.lastStyle) return;
    this.dragType = ResizeDragTypes.ResizeEnd;
    const element = this.findDOMNode();
    this.removeEvents();
    const beforeEndStyle = {
      ...nowStyle,
      node: element,
      dir: this.dir as string
    }
    // 回调函数之后再设置state
    this.props.onResizeEnd && this.props.onResizeEnd(e, beforeEndStyle);
    // 注意判断卸载状态
    if (!this.isUninstall) {
      // 如果props值改变，则设置props值
      const widthChanged = this.props.width !== undefined && this.props.width !== beforeEndStyle?.width;
      const heightChanged = this.props.height !== undefined && this.props?.height !== beforeEndStyle?.height;
      if (widthChanged || heightChanged) {
        this.setStyle({ width: this.lastStyle?.width, height: this.lastStyle?.height }, this.props?.width, this.props?.height);
      } else if (this.props.fixed) {
        this.setStyle({ width: this.lastStyle?.width, height: this.lastStyle?.height }, undefined, undefined)
      }
    }
  }

  render() {
    const {
      children,
      forwardedRef,
      className,
      style,
      childProps
    } = this.props;

    const {
      nowStyle
    } = this.state;

    const ref = forwardedRef ?? this.handleRef;
    const mergeStyle = { ...children?.props?.style, ...style, ...nowStyle };

    return React.cloneElement(React.Children.only(children), {
      className: className ?? children.props?.className,
      ref: ref,
      style: mergeStyle,
      ...childProps
    });
  }
}

const wrapper = function (InnerComponent: typeof DragResize) {
  return React.forwardRef((props: DragResizeProps, ref) => {
    return (
      <InnerComponent forwardedRef={ref} {...props} />
    )
  })
}

export default wrapper(DragResize)