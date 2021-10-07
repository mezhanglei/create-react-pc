import React, { useEffect, useRef, useState, useImperativeHandle } from 'react';
import { isMobile } from "@/utils/verify";
import { addEvent, removeEvent, getEventPosition, getOffsetWH } from "@/utils/dom";
import { EventType, EventHandler, EventDataType, Direction, ResizeAxis, DragResizeProps } from "./type";

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

const DragResize = React.forwardRef<any, DragResizeProps>((props, ref) => {

    const {
        offset = 10
    } = props;

    const nodeRef = useRef<any>();
    const isDraggableRef = useRef<boolean>(false);
    const eventDataRef = useRef<EventDataType>();
    const [eventData, setEventData] = useState<EventDataType>();

    const axisRef = useRef<string>(ResizeAxis.AUTO);

    useImperativeHandle(ref, () => (nodeRef.current));


    // 更新width,height
    useEffect(() => {
        if (props?.width != undefined && !isDraggableRef?.current) {
            eventDataUpdate(eventDataRef.current, { width: props?.width })
        }
        if (props?.height != undefined && !isDraggableRef?.current) {
            eventDataUpdate(eventDataRef.current, { height: props?.height })
        }
    }, [props?.width, props?.height, isDraggableRef?.current]);

    // 更新axis
    useEffect(() => {
        if (props?.axis) axisRef.current = props?.axis;
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
        addEvent(ownerDocument, dragEventFor.cancel, onResizeEnd);
    }

    // 移除停止事件
    const removeStopEvents = () => {
        const ownerDocument = findOwnerDocument();
        removeEvent(ownerDocument, dragEventFor.move, onMove);
        removeEvent(ownerDocument, dragEventFor.stop, onResizeEnd);
        removeEvent(ownerDocument, dragEventFor.cancel, onResizeEnd);
    }


    // 返回鼠标所在的边
    const getDirection = (e: EventType): string => {
        const element = nodeRef.current;
        const position = getEventPosition(e, element);
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
        if (direction === Direction.S && ([ResizeAxis.AUTO, ResizeAxis.Y] as string[]).includes(axisRef.current)) {
            return 'row-resize';
        } else if (direction === Direction.E && ([ResizeAxis.AUTO, ResizeAxis.X] as string[]).includes(axisRef.current)) {
            return 'col-resize';
        } else if (direction?.length === 2 && ([ResizeAxis.ANGLE, ResizeAxis.AUTO] as string[]).includes(axisRef.current)) {
            return direction + '-resize';
        } else {
            return 'default';
        }
    }


    const canDragX = (dir: string): boolean => {
        return ([ResizeAxis.AUTO, ResizeAxis.ANGLE, ResizeAxis.X] as string[]).includes(axisRef.current) && dir.indexOf(Direction.E) > -1;
    };

    const canDragY = (dir: string): boolean => {
        return ([ResizeAxis.AUTO, ResizeAxis.ANGLE, ResizeAxis.Y] as string[]).includes(axisRef.current) && dir.indexOf(Direction.S) > -1;
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
        if (props?.forbid) return;
        const direction = getDirection(e);
        const mouseCursor = getMouseCursor(direction);
        if (mouseCursor === 'default') {
            return;
        } else {
            e.stopImmediatePropagation();
        };
        e.preventDefault();
        const element = nodeRef?.current;
        const position = getEventPosition(e, element);
        const offsetWH = getOffsetWH(element);
        if (!position || !offsetWH) return;

        const eventData = {
            node: element,
            mouseCursor: mouseCursor,
            dir: direction,
            width: offsetWH?.width,
            height: offsetWH?.height,
            zIndex: props?.zIndexRange?.[1],
            lastDir: direction,
            eventX: position?.x,
            eventY: position?.y,
            lastEventX: position?.x,
            lastEventY: position?.y,
            lastW: offsetWH?.width,
            lastH: offsetWH?.height
        }
        props?.onResizeStart && props?.onResizeStart(e, eventData);
        isDraggableRef.current = true;
        eventDataChange(eventData);
        addStopEvents();
    }

    const onMove: EventHandler = (e) => {
        if (props?.forbid) return;
        e.preventDefault();
        const element = nodeRef?.current;
        const direction = getDirection(e);
        const mouseCursor = getMouseCursor(direction);
        element.style.cursor = mouseCursor;
        if (!isDraggableRef.current) return;
        const position = getEventPosition(e, element);
        const offsetWH = getOffsetWH(element);
        if (!position || !offsetWH) return;
        const { lastDir = ResizeAxis.AUTO, lastEventX = 0, lastEventY = 0, lastW = 0, lastH = 0 } = eventDataRef.current || {};

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
            zIndex: props?.zIndexRange?.[1]
        }
        props?.onResizeMoving && props?.onResizeMoving(e, eventData);
        eventDataChange(eventData);
    }

    const onResizeEnd: EventHandler = (e) => {
        if (props?.forbid) return;
        e.preventDefault();
        if (!isDraggableRef.current || !eventDataRef.current) return;
        const eventData = {
            ...eventDataRef.current,
            zIndex: props?.zIndexRange?.[0]
        }
        props.onResizeEnd && props.onResizeEnd(e, eventData);
        isDraggableRef.current = false;
        eventData && eventDataChange(eventData);
        const ownerDocument = findOwnerDocument();
        removeStopEvents();
        addEvent(ownerDocument, dragEventFor.move, onMove);
    }

    const originStyle = (attr: string) => {
        return props?.style?.[attr] ?? props?.children.props.style[attr];
    }

    return React.cloneElement(React.Children.only(props?.children), {
        className: props?.className ?? props?.children.props?.className,
        ref: nodeRef,
        style: {
            ...props?.children.props?.style,
            ...props?.style,
            width: eventData?.width ?? originStyle('width'),
            height: eventData?.height ?? originStyle('height'),
            zIndex: eventData?.zIndex ?? originStyle('zIndex')
        }
    });
})

export default React.memo(DragResize);