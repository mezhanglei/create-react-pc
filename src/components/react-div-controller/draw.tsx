import { isMobile } from '@/utils/verify';
import React, { CSSProperties } from 'react';
import { Direction, DirectionCode, PointerCode, DrawItemProps, DrawItemState, EventHandler, EventType, LastStyle } from './types';
import "./index.less"
import ReactDOM from 'react-dom';
import { addEvent, getEventPosition, getInsidePosition, getOffsetWH, removeEvent } from '@/utils/dom';
import classNames from 'classnames';

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

export const DrawBoard = (props: { children: any, style?: CSSProperties, className?: string }) => {
    return (
        <div className={classNames("drawing-wrap", props?.className)} style={props?.style}>
            {props?.children}
        </div>
    );
}

export class DrawItem extends React.Component<DrawItemProps, DrawItemState> {
    dragging: boolean;
    direction?: string;
    lastStyle?: LastStyle;
    constructor(props: DrawItemProps) {
        super(props);
        this.dragging = false;
        this.state = {
        };
    }

    static defaultProps = {
        offset: 10,
        axis: DirectionCode
    }

    findDOMNode() {
        return this.props?.forwardedRef?.current || ReactDOM.findDOMNode(this);
    }

    componentDidMount() {
        const node = this.findDOMNode();
        this.setState({
            nowStyle: {
                left: this.props.left,
                top: this.props.top,
                width: this.props.width,
                height: this.props.height
            }
        })

        addEvent(node, dragEventFor.start, this.onMoveStart);
        addEvent(node, dragEventFor.move, this.mouseOver);
    }

    componentWillUnmount() {
        const node = this.findDOMNode();
        removeEvent(node, dragEventFor.start, this.onMoveStart);
        removeEvent(node, dragEventFor.move, this.mouseOver);
        this.removeEvents();
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
        addEvent(ownerDocument, dragEventFor.stop, this.onMoveEnd);
        addEvent(ownerDocument, dragEventFor.cancel, this.onMoveEnd);
    }

    // 移除事件
    removeEvents = () => {
        const ownerDocument = this.findOwnerDocument();
        removeEvent(ownerDocument, dragEventFor.move, this.onMove);
        removeEvent(ownerDocument, dragEventFor.stop, this.onMoveEnd);
        removeEvent(ownerDocument, dragEventFor.cancel, this.onMoveEnd);
    }

    componentDidUpdate(prevProps: DrawItemProps, prevState: DrawItemState) {
        const widthChanged = this.props.width !== undefined && (this.props.width !== prevProps.width || this.props.width !== prevState.nowStyle?.width);
        const heightChanged = this.props.height !== undefined && (this.props.height !== prevProps.height || this.props.height !== prevState.nowStyle?.height);
        const leftChanged = this.props.left !== undefined && (this.props.left !== prevProps.left || this.props.left !== prevState.nowStyle?.left);
        const topChanged = this.props.top !== undefined && (this.props.top !== prevProps.top || this.props.top !== prevState.nowStyle?.top);
        if (widthChanged || heightChanged || leftChanged || topChanged) {
            if (!this.dragging) {
                this.setState({
                    nowStyle: {
                        ...this.state.nowStyle,
                        width: this.props?.width,
                        height: this.props?.height,
                        left: this.props?.left,
                        top: this.props?.top
                    }
                })
            }
        }
    }

    static getDerivedStateFromProps(nextProps: DrawItemProps, prevState: DrawItemState) {
        const widthChanged = nextProps.width !== undefined && (nextProps.width !== prevState.prevWidth || nextProps.width !== prevState.nowStyle?.width);
        const heightChanged = nextProps.height !== undefined && (nextProps.height !== prevState.prevHeight || nextProps.height !== prevState.nowStyle?.height);
        const leftChanged = nextProps.left !== undefined && (nextProps.left !== prevState.prevLeft || nextProps.left !== prevState.nowStyle?.left);
        const topChanged = nextProps.top !== undefined && (nextProps.top !== prevState.prevTop || nextProps.top !== prevState.nowStyle?.top);
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

        if (leftChanged) {
            return {
                ...prevState,
                prevLeft: nextProps.left,
            };
        }

        if (topChanged) {
            return {
                ...prevState,
                prevTop: nextProps.top
            };
        }
        return null;
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
        // 内部
        else if (x > distance && x < offsetWH.width - distance && y > distance && y < offsetWH.height - distance) direction = Direction.X + Direction.Y

        return direction;
    };

    // 返回鼠标的样式
    getMouseCursor = (direction: string): string => {
        const {
            axis
        } = this.props;

        if (direction === (Direction.X + Direction.Y) && (axis?.includes(Direction.X) || axis?.includes(Direction.Y))) {
            return 'move'
        } else if (([Direction.N, Direction.S] as string[])?.includes(direction) && (axis?.includes(Direction.N) || axis?.includes(Direction.S))) {
            return 'row-resize';
        } else if (([Direction.W, Direction.E] as string[])?.includes(direction) && (axis?.includes(Direction.W) || axis?.includes(Direction.E))) {
            return 'col-resize';
        } else if (direction?.length === 2 && (axis?.includes(Direction.NE) || axis?.includes(Direction.NW) || axis?.includes(Direction.SE) || axis?.includes(Direction.SW))) {
            return direction + '-resize';
        } else {
            return 'default';
        }
    }

    mouseOver: EventHandler = (e) => {
        const element = this.findDOMNode();
        const direction = this.getDirection(e);
        const mouseCursor = this.getMouseCursor(direction);
        element.style.cursor = mouseCursor;
    }

    onMoveStart: EventHandler = (e) => {
        const {
            forbid
        } = this.props;
        if (forbid) return;
        const direction = this.getDirection(e);
        const eventPosition = getEventPosition(e)
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
        const inside = getInsidePosition(element, element?.parentNode)
        const position = getEventPosition(e, element);
        const offsetWH = getOffsetWH(element);
        if (!position || !offsetWH || !inside || !eventPosition) return;

        this.props?.onMoveStart && this.props?.onMoveStart(e, {
            node: element,
            dir: direction,
            width: offsetWH?.width,
            height: offsetWH?.height,
            left: inside?.left,
            top: inside?.top
        });

        this.setState({
            nowStyle: {
                width: offsetWH?.width,
                height: offsetWH?.height,
                left: inside?.left,
                top: inside?.top
            }
        });

        this.lastStyle = {
            width: offsetWH?.width,
            height: offsetWH?.height,
            left: inside?.left,
            top: inside?.top,
            eventX: eventPosition?.x,
            eventY: eventPosition?.y,
        }
        this.addEvents();
    }

    onMove: EventHandler = (e) => {
        const {
            forbid,
            axis
        } = this.props;
        if (forbid) return;
        e.preventDefault();
        const element = this.findDOMNode();
        if (!this.dragging) return;
        const offsetWH = getOffsetWH(element);
        const eventPosition = getEventPosition(e)
        const dir = this.direction;
        const lastStyle = this.lastStyle;
        const parentNodeOffsetWH = getOffsetWH(element?.parentNode);
        if (!offsetWH || !dir || !lastStyle || !parentNodeOffsetWH || !eventPosition) return;

        const newStyle = this.transform({
            direction: dir,
            axis: axis,
            lastStyle: lastStyle,
            eventX: eventPosition?.x,
            eventY: eventPosition?.y,
            wrapStyle: parentNodeOffsetWH
        })

        this.props?.onMove && this.props?.onMove(e, {
            ...newStyle,
            node: element,
            dir: dir
        });
        this.setState({
            nowStyle: newStyle
        });
    }

    onMoveEnd: EventHandler = (e) => {
        const {
            forbid
        } = this.props;
        if (forbid) return;
        e.preventDefault();
        if (!this.dragging || !this.state.nowStyle) return;

        const nowStyle = {
            ...this.state.nowStyle
        }

        const element = this.findDOMNode();
        this.props.onMoveEnd && this.props.onMoveEnd(e, {
            ...nowStyle,
            node: element,
            dir: this.direction
        });
        this.dragging = false;
        this.removeEvents();
    }

    transform(props: { direction: string, axis: Direction[], lastStyle: LastStyle, eventX: number, eventY: number, wrapStyle: { width: number, height: number } }) {
        const direction = props?.direction;
        const lastStyle = props?.lastStyle;
        const wrapStyle = props?.wrapStyle;
        const eventX = props?.eventX;
        const eventY = props?.eventY;
        const style = { ...lastStyle }
        const deltalX = eventX - lastStyle.eventX;
        const deltalY = eventY - lastStyle.eventY;
        const rightDeltalX = Math.min(deltalX, wrapStyle.width - lastStyle?.width - lastStyle?.left);
        const leftDeltalX = Math.max(deltalX, -lastStyle?.left);
        const bottomDeltalY = Math.min(deltalY, wrapStyle.height - lastStyle?.height - lastStyle?.top);
        const topDeltalY = Math.max(deltalY, -lastStyle?.top);
        switch (direction) {
            // 拖拽移动
            case Direction.X + Direction.Y:
                if (props?.axis?.includes(Direction.X)) {
                    const left = lastStyle.left + deltalX;
                    style.left = Math.max(0, Math.min(left, wrapStyle.width - style.width));
                }
                if (props?.axis?.includes(Direction.Y)) {
                    const top = lastStyle.top + deltalY;
                    style.top = Math.max(0, Math.min(top, wrapStyle.height - style.height));
                }
                break
            // 东
            case 'e':
                // 向右拖拽添加宽度
                style.width += rightDeltalX;
                return style
            // 西
            case 'w':
                // 增加宽度、位置同步左移
                style.width -= leftDeltalX;
                style.left += leftDeltalX;
                return style
            // 南
            case 's':
                style.height += bottomDeltalY;
                return style
            // 北
            case 'n':
                style.height -= topDeltalY;
                style.top += topDeltalY;
                break
            // 东北
            case 'ne':
                style.height -= topDeltalY;
                style.top += topDeltalY;
                style.width += rightDeltalX;
                break
            // 西北
            case 'nw':
                style.height -= topDeltalY;
                style.top += topDeltalY;
                style.width -= leftDeltalX;
                style.left += leftDeltalX;
                break
            // 东南
            case 'se':
                style.height += bottomDeltalY;
                style.width += rightDeltalX;
                break
            // 西南
            case 'sw':
                style.height += bottomDeltalY;
                style.width -= leftDeltalX;
                style.left += leftDeltalX;
                break
            // 拖拽移动
            case 'rotate':
                // 先计算下元素的中心点, x，y 作为坐标原点
                const x = style.width / 2 + style.left;
                const y = style.height / 2 + style.top;
                // 当前的鼠标坐标
                const x1 = eventX;
                const y1 = eventY;
                // 运用高中的三角函数
                style.transform = `rotate(${(Math.atan2((y1 - y), (x1 - x))) * (180 / Math.PI) - 90}deg)`;
                break
        }
        return style
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

        const originStyle = (attr: string) => {
            return style?.[attr];
        }

        const styleRet = {
            ...style,
            position: 'absolute',
            width: nowStyle?.width ?? originStyle('width'),
            height: nowStyle?.height ?? originStyle('height'),
            left: nowStyle?.left ?? originStyle('left'),
            top: nowStyle?.top ?? originStyle('top')
        }

        return (
            <div ref={forwardedRef} className={classNames("drawing-item", className)} style={styleRet}>
                {children}
                {PointerCode?.map((item) => (<div key={item} className={`control-point point-${item}`}></div>))}
            </div>
        );
    }
}