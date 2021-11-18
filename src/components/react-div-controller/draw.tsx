import { isMobile } from '@/utils/verify';
import React, { CSSProperties } from 'react';
import { Direction, DirectionCode, DrawItemProps, DrawItemState, EventHandler, EventType, LastStyle } from './types';
import "./index.less"
import ReactDOM from 'react-dom';
import { addEvent, getEventPosition, getOffsetWH, removeEvent } from '@/utils/dom';

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

export interface BoardContextInterface {

}

export const BoardContext = React.createContext<BoardContextInterface | null>(null);

export const DrawBoard = (props: { children: any }) => {
    return (
        <div className="drawing-wrap">
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
        const nodeStyle = node?.style;
        this.setState({
            nowStyle: {
                left: this.props.left || nodeStyle?.left,
                top: this.props.top || nodeStyle?.top,
                width: this.props.width || nodeStyle?.width,
                height: this.props.height || nodeStyle?.height
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
        // 内部
        else if (x > distance && x < offsetWH.width - distance && y > distance && y < offsetWH.height - distance) direction = 'move'

        return direction;
    };

    // 返回鼠标的样式
    getMouseCursor = (direction: string): string => {
        const {
            axis
        } = this.props;
        if (direction === 'move' && (axis?.includes(Direction.X) || axis?.includes(Direction.Y))) {
            return 'pointer'
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
        const nodeStyle = element?.style;
        const position = getEventPosition(e, element);
        const offsetWH = getOffsetWH(element);
        const left = element?.style?.left;
        const top = element?.style?.top;
        if (!position || !offsetWH) return;

        this.props?.onResizeStart && this.props?.onResizeStart(e, {
            node: element,
            dir: direction,
            width: offsetWH?.width || nodeStyle?.width,
            height: offsetWH?.height || nodeStyle?.height,
            left: left || nodeStyle?.left,
            top: top || nodeStyle?.top
        });

        this.setState({
            nowStyle: {
                width: offsetWH?.width || nodeStyle?.width,
                height: offsetWH?.height || nodeStyle?.height,
                left: left || nodeStyle?.left,
                top: top || nodeStyle?.top
            }
        });

        this.lastStyle = {
            width: offsetWH?.width || nodeStyle?.width,
            height: offsetWH?.height || nodeStyle?.height,
            left: left || nodeStyle?.left,
            top: top || nodeStyle?.top,
            eventX: e.clientX,
            eventY: e.clientY,
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
        const dir = this.direction;
        const lastStyle = this.lastStyle;
        if (!offsetWH || !dir || !lastStyle) return;

        const newStyle = this.transform({
            direction: dir,
            axis: axis,
            lastStyle: lastStyle,
            eventX: e?.clientX,
            eventY: e?.clientY,
            wrapStyle: element?.parentNode?.style
        })

        this.props?.onResizeMoving && this.props?.onResizeMoving(e, {
            ...newStyle,
            node: element,
            dir: dir
        });
        this.setState({
            nowStyle: newStyle
        });
    }

    onResizeEnd: EventHandler = (e) => {
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
        this.props.onResizeEnd && this.props.onResizeEnd(e, {
            ...nowStyle,
            node: element,
            dir: this.direction
        });
        this.dragging = false;
        this.removeEvents();
    }

    transform(props: { direction: string, axis: Direction[], lastStyle: LastStyle, eventX: number, eventY: number, wrapStyle: CSSProperties }) {
        const direction = props?.direction;
        const lastStyle = props?.lastStyle;
        const wrapStyle = props?.wrapStyle;
        const eventX = props?.eventX;
        const eventY = props?.eventY;
        const style = { ...lastStyle }
        const deltaX = eventX - lastStyle.eventX;
        const deltaY = eventY - lastStyle.eventY;

        switch (direction) {
            // 拖拽移动
            case 'move':
                // 元素当前位置 + 偏移量
                const top = lastStyle.top + deltaY;
                const left = lastStyle.left + deltaX;
                // 限制必须在这个范围内移动 画板的高度-元素的高度
                style.top = Math.max(0, Math.min(top, wrapStyle.height - style.height));
                style.left = Math.max(0, Math.min(left, wrapStyle.width - style.width));
                break
            // 东
            case 'e':
                // 向右拖拽添加宽度
                style.width += deltaX;
                return style
            // 西
            case 'w':
                // 增加宽度、位置同步左移
                style.width -= deltaX;
                style.left += deltaX;
                return style
            // 南
            case 's':
                style.height += deltaY;
                return style
            // 北
            case 'n':
                style.height -= deltaY;
                style.top += deltaY;
                break
            // 东北
            case 'ne':
                style.height -= deltaY;
                style.top += deltaY;
                style.width += deltaX;
                break
            // 西北
            case 'nw':
                style.height -= deltaY;
                style.top += deltaY;
                style.width -= deltaX;
                style.left += deltaX;
                break
            // 东南
            case 'se':
                style.height += deltaY;
                style.width += deltaX;
                break
            // 西南
            case 'sw':
                style.height += deltaY;
                style.width -= deltaX;
                style.left += deltaX;
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
            className
        } = this.props;


        const {
            nowStyle
        } = this.state;

        return React.cloneElement(React.Children.only(children), {
            className: className ?? children.props?.className,
            ref: forwardedRef,
            style: {
                ...children.props?.style,
                ...nowStyle,
                position: 'absolute'
            }
        });
    }
}