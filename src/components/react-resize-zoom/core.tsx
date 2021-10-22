import React from 'react';
import { isMobile } from "@/utils/verify";
import { addEvent, removeEvent, getEventPosition, getOffsetWH } from "@/utils/dom";
import { EventType, EventHandler, Direction, ResizeAxis, DragResizeProps, DragResizeState } from "./type";
import ReactDOM from 'react-dom';

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
    constructor(props: DragResizeProps) {
        super(props);
        this.dragging = false;
        this.state = {
        };
    }
    static defaultProps = {
        offset: 10,
        axis: ResizeAxis.AUTO
    }

    componentDidUpdate(prevProps: DragResizeProps, prevState: DragResizeState) {
        const widthChanged = this.props.width !== prevProps.width;
        const heightChanged = this.props.height !== prevProps.height;
        if (widthChanged || heightChanged) {
            this.updateState()
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
        this.setState({
            eventData: {
                node,
                width: this.props?.width,
                height: this.props?.height
            }
        })

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
        return this.props?.forwardedRef.current || ReactDOM.findDOMNode(this);
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

    updateState = () => {
        if (!this.dragging) {
            this.setState({
                eventData: {
                    ...this.state.eventData,
                    width: this.props?.width,
                    height: this.props?.height
                }
            })
        }
    }

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
        if (direction === Direction.S && ([ResizeAxis.AUTO, ResizeAxis.Y] as string[]).includes(axis)) {
            return 'row-resize';
        } else if (direction === Direction.E && ([ResizeAxis.AUTO, ResizeAxis.X] as string[]).includes(axis)) {
            return 'col-resize';
        } else if (direction?.length === 2 && ([ResizeAxis.ANGLE, ResizeAxis.AUTO] as string[]).includes(axis)) {
            return direction + '-resize';
        } else {
            return 'default';
        }
    }

    canDragX = (dir: string): boolean => {
        const {
            axis
        } = this.props;
        return ([ResizeAxis.AUTO, ResizeAxis.ANGLE, ResizeAxis.X] as string[]).includes(axis) && dir.indexOf(Direction.E) > -1;
    };

    canDragY = (dir: string): boolean => {
        const {
            axis
        } = this.props;
        return ([ResizeAxis.AUTO, ResizeAxis.ANGLE, ResizeAxis.Y] as string[]).includes(axis) && dir.indexOf(Direction.S) > -1;
    };

    mouseOver: EventHandler = (e) => {
        const element = this.findDOMNode();
        const direction = this.getDirection(e);
        const mouseCursor = this.getMouseCursor(direction);
        element.style.cursor = mouseCursor;
    }

    onResizeStart: EventHandler = (e) => {
        const {
            forbid,
            zIndexRange
        } = this.props;
        if (forbid) return;
        const direction = this.getDirection(e);
        const mouseCursor = this.getMouseCursor(direction);
        if (mouseCursor === 'default') {
            return;
        } else {
            e.stopImmediatePropagation();
        };
        e.preventDefault();
        const element = this.findDOMNode();
        const position = getEventPosition(e, element);
        const offsetWH = getOffsetWH(element);
        if (!position || !offsetWH) return;

        const eventData = {
            node: element,
            dir: direction,
            width: offsetWH?.width,
            height: offsetWH?.height,
            zIndex: zIndexRange?.[1],
            eventX: position?.x,
            eventY: position?.y,
            lastEventX: position?.x,
            lastEventY: position?.y,
            lastW: offsetWH?.width,
            lastH: offsetWH?.height
        }
        this.props?.onResizeStart && this.props?.onResizeStart(e, eventData);
        this.dragging = true;
        this.setState({
            eventData
        })
        this.addEvents();
    }

    onMove: EventHandler = (e) => {
        const {
            forbid,
            zIndexRange
        } = this.props;
        if (forbid) return;
        e.preventDefault();
        const element = this.findDOMNode();
        if (!this.dragging) return;
        const position = getEventPosition(e, element);
        const offsetWH = getOffsetWH(element);
        if (!position || !offsetWH) return;
        const { dir = ResizeAxis.AUTO, lastEventX = 0, lastEventY = 0, lastW = 0, lastH = 0 } = this.state.eventData || {};

        let deltaX, deltaY;
        deltaX = position?.x - lastEventX;
        deltaY = position?.y - lastEventY;

        const eventData = {
            ...this.state.eventData,
            node: element,
            eventX: position?.x,
            eventY: position?.y,
            width: this.canDragX(dir) ? (lastW + deltaX) : lastW,
            height: this.canDragY(dir) ? (lastH + deltaY) : lastH,
            zIndex: zIndexRange?.[1]
        }
        this.props?.onResizeMoving && this.props?.onResizeMoving(e, eventData);
        this.setState({
            eventData
        })
    }

    onResizeEnd: EventHandler = (e) => {
        const {
            forbid,
            zIndexRange
        } = this.props;
        if (forbid) return;
        e.preventDefault();
        if (!this.dragging || !this.state.eventData) return;
        const eventData = {
            ...this.state.eventData,
            zIndex: zIndexRange?.[0]
        }
        this.props.onResizeEnd && this.props.onResizeEnd(e, eventData);
        this.dragging = false;
        this.setState({
            eventData
        })
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
            eventData
        } = this.state;

        const originStyle = (attr: string) => {
            return style?.[attr] ?? children.props.style[attr];
        }

        return React.cloneElement(React.Children.only(children), {
            className: className ?? children.props?.className,
            ref: forwardedRef,
            style: {
                ...children.props?.style,
                ...style,
                width: eventData?.width ?? originStyle('width'),
                height: eventData?.height ?? originStyle('height'),
                zIndex: eventData?.zIndex ?? originStyle('zIndex')
            }
        });
    }
}

const wrapper = function (InnerComponent: any) {
    return React.forwardRef((props, ref) => {
        return (
            <InnerComponent forwardedRef={ref} {...props} />
        )
    })
}

export default wrapper(DragResize)