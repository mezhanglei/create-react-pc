import React, { useEffect, useRef, useState, useImperativeHandle } from 'react';
import { isMobile } from "@/utils/verify";
import { addEvent, removeEvent, getPositionInParent, getOffsetWH } from "@/utils/dom";
import { EventType, EventHandler, EventDataType, Direction, Axis, DragResizeProps } from "./type";

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
        offset = 10,
        zIndexRange = [],
        width,
        height,
        forbid,
        className,
        style
    } = props;

    const nodeRef = useRef<any>();
    const isDraggableRef = useRef<boolean>(false);
    const eventDataRef = useRef<EventDataType>();
    const [eventData, setEventData] = useState<EventDataType>();

    const axisRef = useRef<string>(Axis.AUTO);

    useImperativeHandle(ref, () => (nodeRef.current));


    // 更新width,height
    useEffect(() => {
        if (width != undefined && !isDraggableRef?.current) {
            eventDataUpdate(eventDataRef.current, { width })
        }
        if (height != undefined && !isDraggableRef?.current) {
            eventDataUpdate(eventDataRef.current, { height })
        }
    }, [width, height, isDraggableRef?.current]);

    // 更新axis
    useEffect(() => {
        if(props?.axis) axisRef.current = props?.axis;
    }, [props.axis])

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
        addEvent(nodeRef.current, dragEventFor.start, onResizeStart);
        addEvent(ownerDocument, dragEventFor.move, onMove);
        return () => {
            removeEvent(nodeRef.current, dragEventFor.start, onResizeStart);
            removeEvent(ownerDocument, dragEventFor.move, onMove);
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
        const position = getPositionInParent(e, element);
        const offsetWH = getOffsetWH(element);
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
    const getMouseCursor = (direction: string): string => {
        if (direction === Direction.S && ([Axis.AUTO, Axis.Y] as string[]).includes(axisRef.current)) {
            return 'row-resize';
        } else if (direction === Direction.E && ([Axis.AUTO, Axis.X] as string[]).includes(axisRef.current)) {
            return 'col-resize';
        } else if (direction?.length === 2 && ([Axis.ANGLE, Axis.AUTO] as string[]).includes(axisRef.current)) {
            return direction + '-resize';
        } else {
            return 'default';
        }
    }


    const canDragX = (dir: string): boolean => {
        return ([Axis.AUTO, Axis.ANGLE, Axis.X] as string[]).includes(axisRef.current) && dir.indexOf(Direction.E) > -1;
    };

    const canDragY = (dir: string): boolean => {
        return ([Axis.AUTO, Axis.ANGLE, Axis.Y] as string[]).includes(axisRef.current) && dir.indexOf(Direction.S) > -1;
    };

    const eventDataChange = (value: EventDataType) => {
        eventDataRef.current = value;
        setEventData(value);
    }

    const eventDataUpdate = (eventData: EventDataType | undefined, data: any) => {
        const value = { ...eventData, ...data };
        eventDataRef.current = value;
        setEventData(value);
    }

    const onResizeStart: EventHandler = (e) => {
        if(forbid) return;
        const direction = getDirection(e);
        const mouseCursor = getMouseCursor(direction);
        if (mouseCursor === 'default') {
            return;
        } else {
            e.stopImmediatePropagation();
        };
        e.preventDefault();
        const element = nodeRef?.current;
        const position = getPositionInParent(e, element);
        const offsetWH = getOffsetWH(element);
        if (!position || !offsetWH) return;

        const eventData = {
            node: element,
            mouseCursor: mouseCursor,
            dir: direction,
            width: offsetWH?.width,
            height: offsetWH?.height,
            zIndex: zIndexRange[1],
            lastDir: direction,
            eventX: position?.x,
            eventY: position?.y,
            lastEventX: position?.x,
            lastEventY: position?.y,
            lastW: offsetWH?.width,
            lastH: offsetWH?.height
        }
        const shouldUpdate = props?.onResizeStart && props?.onResizeStart(e, eventData);
        if (shouldUpdate === false) return;
        isDraggableRef.current = true;

        eventDataChange(eventData);
        addStopEvents();
    }

    const onMove: EventHandler = (e) => {
        if(forbid) return;
        e.preventDefault();
        const element = nodeRef?.current;
        const direction = getDirection(e);
        const mouseCursor = getMouseCursor(direction);
        element.style.cursor = mouseCursor;
        if (!isDraggableRef.current) return;
        const position = getPositionInParent(e, element);
        const offsetWH = getOffsetWH(element);
        if (!position || !offsetWH) return;
        const { lastDir = Axis.AUTO, lastEventX = 0, lastEventY = 0, lastW = 0, lastH = 0 } = eventDataRef.current || {};

        let deltaX, deltaY;
        deltaX = position?.x - lastEventX;
        deltaY = position?.y - lastEventY;

        const eventData = {
            ...eventDataRef.current,
            node: element,
            mouseCursor: mouseCursor,
            dir: direction,
            eventX: position?.x,
            eventY: position?.y,
            width: canDragX(lastDir) ? (lastW + deltaX) : lastW,
            height: canDragY(lastDir) ? (lastH + deltaY) : lastH,
            zIndex: zIndexRange[1]
        }

        const shouldUpdate = props?.onResizeMoving && props?.onResizeMoving(e, eventData);
        if (shouldUpdate === false) return;

        eventDataChange(eventData);
    }

    const onResizeEnd: EventHandler = (e) => {
        e.preventDefault();
        if (!isDraggableRef.current || !eventDataRef.current) return;
        const eventData = {
            ...eventDataRef.current,
            zIndex: zIndexRange[0]
        }
        const shouldContinue = props.onResizeEnd && props.onResizeEnd(e, eventData);
        if (shouldContinue === false) return false;

        isDraggableRef.current = false;
        eventData && eventDataChange(eventData);
        const ownerDocument = findOwnerDocument();
        removeEvent(ownerDocument, dragEventFor.move, onMove);
        removeStopEvents();
        addEvent(ownerDocument, dragEventFor.move, onMove);
    }

    // dragOver事件
    const onDragOver: EventHandler = (e) => {
        isDraggableRef.current = false;
    }

    return React.cloneElement(React.Children.only(children), {
        className: className ?? children.props?.className,
        ref: nodeRef,
        style: {
            ...children.props?.style,
            ...style,
            width: eventData?.width ?? style?.width ?? children.props.style?.width,
            height: eventData?.height ?? style?.height ?? children.props.style?.height,
            zIndex: eventData?.zIndex ?? style?.zIndex ?? children.props.style?.zIndex
        }
    });
})

export default React.memo(DragResize);