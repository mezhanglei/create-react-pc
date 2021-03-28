import React, { useEffect, useRef, useState, useImperativeHandle } from 'react';
import { isMobile } from "@/utils/verify";
import { addEvent, removeEvent, getClientXYInParent, getClientWH } from "@/utils/dom";
import { EventType, EventHandler, LastEventDataType, EventDataType, Direction, Axis, DragResizeProps } from "./type";

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

const DragResize = React.forwardRef<any, DragResizeProps>((props, ref) => {

    const {
        children,
        axis = Axis.AUTO,
        offset = 10,
        zIndexRange = [1, 2],
        className,
        style
    } = props;

    const nodeRef = useRef<any>();
    const isDraggableRef = useRef<boolean>(false);
    const lastEventDataRef = useRef<LastEventDataType>();
    const eventDataRef = useRef<EventDataType>();
    const [eventData, setEventData] = useState<EventDataType>();

    useImperativeHandle(ref, () => (nodeRef.current));

    // 顶层document对象（有的环境可能删除了document顶层环境）
    const findOwnerDocument = (): Document => {
        const node = nodeRef?.current;
        const nodeStyle = node?.ownerDocument?.defaultView?.getComputedStyle(node);
        if (nodeStyle?.display === "inline") {
            throw new Error("the style of `props.children` cannot is `inline`!");
        }
        return node?.ownerDocument;
    };


    useEffect(() => {
        const ownerDocument = findOwnerDocument();
        addEvent(ownerDocument, dragEventFor.move, onMove);
        addStopEvents();
        return () => {
            removeEvent(ownerDocument, dragEventFor.move, onMove);
            removeStopEvents();
        }
    }, []);

    // 监听停止事件
    const addStopEvents = () => {
        const ownerDocument = findOwnerDocument();
        addEvent(ownerDocument, dragEventFor.stop, onResizeEnd);
        addEvent(ownerDocument, 'dragover', onDragOver);
        addEvent(ownerDocument, 'touchcancel', onResizeEnd);
    }

    // 移除停止事件
    const removeStopEvents = () => {
        const ownerDocument = findOwnerDocument();
        removeEvent(ownerDocument, dragEventFor.stop, onResizeEnd);
        removeEvent(ownerDocument, 'dragover', onDragOver);
        removeEvent(ownerDocument, 'touchcancel', onResizeEnd);
    }


    // 返回鼠标所在的边
    const getDirection = (e: EventType): string => {
        const element = nodeRef.current;
        const clientXY = getClientXYInParent(e, element);
        const clientWH = getClientWH(element);
        if (!clientXY || !clientWH) return '';
        const distance = offset;
        const { x, y } = clientXY;
        let direction = '';
        // 上边
        if (y < distance && y > -distance) direction += Direction.N;
        // 下边
        else if (y > clientWH?.height - distance && y < clientWH?.height + distance) direction += Direction.S;
        // 左边
        if (x < distance && x > -distance) direction += Direction.W;
        // 右边
        else if (x > clientWH?.width - distance && x < clientWH?.width + distance) direction += Direction.E;

        return direction;
    };

    // 返回鼠标的样式
    const getMouseCursor = (e: EventType, direction: string): string => {
        if (direction === Direction.S && (canDragY(e, direction) && axis !== Axis.ANGLE || axis === Axis.AUTO)) {
            return 'row-resize';
        } else if (direction === Direction.E && (canDragX(e, direction) && axis !== Axis.ANGLE || axis === Axis.AUTO)) {
            return 'col-resize';
        } else if (direction?.length === 2 && (axis === Axis.ANGLE || axis === Axis.AUTO)) {
            return direction + '-resize';
        } else {
            return 'default';
        }
    }


    const canDragX = (e: EventType, dir: string): boolean => {
        return (axis === Axis.AUTO || axis === Axis.ANGLE) && dir.indexOf(Direction.E) > -1 || axis === Axis.X;
    };

    const canDragY = (e: EventType, dir: string): boolean => {
        return (axis === Axis.AUTO || axis === Axis.ANGLE) && dir.indexOf(Direction.S) > -1 || axis === Axis.Y;
    };

    const eventDataChange = (value: EventDataType) => {
        eventDataRef.current = value;
        setEventData(value);
    }

    const onResizeStart: EventHandler<EventType> = (e) => {
        const direction = getDirection(e);
        const mouseCursor = getMouseCursor(e, direction);
        if (mouseCursor === 'default') return;

        const clientXY = getClientXYInParent(e, nodeRef?.current);
        const clientWH = getClientWH(nodeRef.current);
        if (!clientXY || !clientWH) return;

        const eventData = {
            x: clientXY?.x,
            y: clientXY?.y,
            width: clientWH?.width,
            height: clientWH?.height,
            zIndex: zIndexRange[1]
        }
        const shouldUpdate = props?.onResizeStart && props?.onResizeStart(e, eventData);
        if (shouldUpdate === false) return;

        e.stopPropagation();
        e.preventDefault();
        isDraggableRef.current = true;

        lastEventDataRef.current = {
            lastDir: direction,
            lastX: clientXY?.x,
            lastY: clientXY?.y,
            lastW: clientWH?.width,
            lastH: clientWH?.height
        }

        eventDataChange(eventData);
    }

    const onMove: EventHandler<EventType> = (e) => {
        e.preventDefault();
        const direction = getDirection(e);
        const mouseCursor = getMouseCursor(e, direction);
        nodeRef.current.style.cursor = mouseCursor;
        if (!isDraggableRef.current) return;

        const clientXY = getClientXYInParent(e, nodeRef?.current);
        const clientWH = getClientWH(nodeRef.current);
        if (!clientXY || !clientWH) return;
        const { lastDir = Axis.AUTO, lastX = 0, lastY = 0, lastW = 0, lastH = 0 } = lastEventDataRef.current || {};

        let deltaX, deltaY;
        deltaX = clientXY?.x - lastX;
        deltaY = clientXY?.y - lastY;

        const eventData = {
            x: clientXY?.x,
            y: clientXY?.y,
            width: canDragX(e, lastDir) ? (lastW + deltaX) : lastW,
            height: canDragY(e, lastDir) ? (lastH + deltaY) : lastH,
            zIndex: zIndexRange[1]
        }

        const shouldUpdate = props?.onResizeMoving && props?.onResizeMoving(e, eventData);
        if (shouldUpdate === false) return;

        eventDataChange(eventData);
    }

    const onResizeEnd: EventHandler<EventType> = (e) => {
        if (!isDraggableRef.current || !eventDataRef.current) return;
        const eventData = {
            ...eventDataRef.current,
            zIndex: zIndexRange[0]
        }
        const shouldContinue = props.onResizeEnd && props.onResizeEnd(e, eventData);
        if (shouldContinue === false) return false;

        isDraggableRef.current = false;
        eventData && eventDataChange(eventData);
    }

    // dragOver事件
    const onDragOver: EventHandler<EventType> = (e) => {
        isDraggableRef.current = false;
    }

    return React.cloneElement(React.Children.only(children), {
        onMouseDown: onResizeStart,
        onTouchStart: onResizeStart,
        className: className ?? children.props.className,
        ref: nodeRef,
        style: {
            ...children.props.style,
            ...style,
            width: eventData?.width ?? children.props.style?.width,
            height: eventData?.height ?? children.props.style?.height,
            zIndex: eventData?.zIndex ?? children.props.style?.zIndex
        }
    });
})

export default DragResize;



