import React, { useEffect, useImperativeHandle, useRef } from 'react';
import { matchParent, addEvent, removeEvent, getPositionInParent, findElement } from "@/utils/dom";
import { addUserSelectStyles, removeUserSelectStyles, snapToGrid } from "./utils/dom";
import { isMobile, isEventTouch } from "@/utils/verify";
import { DraggableEventProps, EventData, EventType } from "./utils/types";

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

// 拖拽事件组件
const DraggableEvent = React.forwardRef<any, DraggableEventProps>((props, ref) => {

    const {
        children,
        onDragStart,
        onDrag,
        onDragStop,
        allowAnyClick,
        disabled,
        enableUserSelectHack,
        grid
    } = props;

    let draggingRef = useRef<boolean>(false);
    let eventDataRef = useRef<EventData>();
    const nodeRef = useRef<any>();


    useImperativeHandle(ref, () => (nodeRef?.current));

    // 顶层document对象（有的环境可能删除了document顶层环境）
    const findOwnerDocument = () => {
        const node = nodeRef?.current;
        return node?.ownerDocument;
    };

    // 拖拽句柄
    const findDragNode = () => {
        const node = props.dragNode && findElement(props.dragNode) || nodeRef?.current;
        const childStyle = node?.ownerDocument?.defaultView?.getComputedStyle(nodeRef?.current);
        if (childStyle?.display === "inline") {
            throw new Error("the style of `props.children` cannot is `inline`, because `transform` has no effect on Element ");
        }
        return node;
    };

    // 禁止拖拽的节点
    const findDisabledNode = () => {
        const node = props.disabledNode && findElement(props.disabledNode);
        return node;
    };

    // 限制范围的父元素
    const findBoundsParent = () => {
        const ownerDocument = findOwnerDocument();
        const node = (props.bounds && findElement(props.bounds)) || ownerDocument?.body || ownerDocument?.documentElement;
        return node;
    };

    useEffect(() => {
        const ownerDocument = findOwnerDocument();
        const dragNode = findDragNode();
        addEvent(dragNode, dragEventFor.start, handleDragStart);
        return () => {
            removeEvent(dragNode, dragEventFor.start, handleDragStart);
            removeEvent(ownerDocument, dragEventFor.move, handleDrag);
            removeEvent(ownerDocument, dragEventFor.stop, handleDragStop);
            removeEvent(ownerDocument, dragEventFor.cancel, handleDragStop);
            // 移除选中样式
            if (enableUserSelectHack) removeUserSelectStyles(ownerDocument);
        };
    }, []);

    const handleDragStart = (e: EventType) => {
        const dragNode = findDragNode();
        const disabledNode = findDisabledNode();
        const boundsParent = findBoundsParent();
        const ownerDocument = findOwnerDocument();
        e.preventDefault();

        if (!ownerDocument) {
            throw new Error('<DraggableEvent> not mounted on DragStart!');
        }

        // pc端鼠标操作时允许非左键操作
        if (!allowAnyClick && !isEventTouch(e) && typeof e.button === 'number' && e.button !== 0) return;
        // 移动设备阻止默认行为
        if (e.type === 'touchstart') e.preventDefault();

        // props控制是否拖拽
        if (disabled ||
            (!(e.target instanceof ownerDocument?.defaultView?.Node)) ||
            (dragNode && !matchParent(e.target, dragNode)) ||
            (disabledNode && matchParent(e.target, disabledNode))) {
            return;
        }

        // 获取在指定父元素内的位置
        const { x, y } = boundsParent && getPositionInParent(e, boundsParent) || {};

        // 返回事件对象相关的位置信息
        const lastEventX = eventDataRef?.current?.lastEventX ?? x;
        const lastEventY = eventDataRef?.current?.lastEventY ?? y;
        eventDataRef.current = {
            node: nodeRef.current,
            deltaX: 0,
            deltaY: 0,
            lastEventX: lastEventX,
            lastEventY: lastEventY,
            eventX: x,
            eventY: y
        };

        // 如果没有完成渲染或者返回false则禁止拖拽
        const shouldUpdate = onDragStart && onDragStart(e, eventDataRef.current);
        if (shouldUpdate === false) return;

        // 滚动过程中选中文本被添加样式
        if (enableUserSelectHack) addUserSelectStyles(ownerDocument);

        draggingRef.current = true;
        eventDataRef.current = {
            ...eventDataRef.current,
            lastEventX: x,
            lastEventY: y
        }

        addEvent(ownerDocument, dragEventFor.move, handleDrag);
        addEvent(ownerDocument, dragEventFor.stop, handleDragStop);
        addEvent(ownerDocument, dragEventFor.cancel, handleDragStop);
    };

    const handleDrag = (e: EventType) => {
        if (!draggingRef.current) return;
        const boundsParent = findBoundsParent();
        e.preventDefault();
        // 获取在指定父元素内的位置
        let { x, y } = boundsParent && getPositionInParent(e, boundsParent) || {};
        if (!eventDataRef.current) return;

        // 拖拽跳跃,可设置多少幅度跳跃一次
        if (Array.isArray(grid)) {
            const { lastEventX, lastEventY } = eventDataRef.current;
            let deltaX = x - lastEventX, deltaY = y - lastEventY;
            [deltaX, deltaY] = snapToGrid(grid, deltaX, deltaY);
            if (!deltaX && !deltaY) return; // skip useless drag
            x = lastEventX + deltaX, y = lastEventY + deltaY;
        }

        // 返回事件对象相关的位置信息
        const lastEventX = eventDataRef?.current?.lastEventX ?? x;
        const lastEventY = eventDataRef?.current?.lastEventY ?? y;
 
        eventDataRef.current = {
            node: nodeRef?.current,
            deltaX: x - lastEventX,
            deltaY: y - lastEventY,
            lastEventX: lastEventX,
            lastEventY: lastEventY,
            eventX: x,
            eventY: y
        }

        // 返回false则禁止拖拽并初始化鼠标事件
        const shouldUpdate = onDrag && onDrag(e, eventDataRef.current);
        if (shouldUpdate === false) {
            try {
                handleDragStop(new MouseEvent(e?.type));
            } catch (err) {
                // 兼容废弃版本
                const event = document.createEvent('MouseEvents');
                event.initMouseEvent('mouseup', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                handleDragStop(event);
            }
            return;
        }

        eventDataRef.current = {
            ...eventDataRef.current,
            lastEventX: x,
            lastEventY: y
        }
    };

    const handleDragStop = (e: EventType) => {
        if (!draggingRef.current || !eventDataRef.current) return;
        e.preventDefault();
        const ownerDocument = findOwnerDocument();

        eventDataRef.current = {
            ...eventDataRef.current,
            deltaX: 0,
            deltaY: 0
        }

        const shouldContinue = onDragStop && onDragStop(e, eventDataRef.current);
        if (shouldContinue === false) return;

        // 移除文本因滚动造成的显示
        if (ownerDocument) {
            // Remove user-select hack
            if (enableUserSelectHack) removeUserSelectStyles(ownerDocument);
        }

        // 重置
        draggingRef.current = false;

        if (ownerDocument) {
            removeEvent(ownerDocument, dragEventFor.move, handleDrag);
            removeEvent(ownerDocument, dragEventFor.stop, handleDragStop);
            removeEvent(ownerDocument, dragEventFor.cancel, handleDragStop);
        }
    };

    return React.cloneElement(React.Children.only(children), {
        ref: nodeRef
    });
});

export default DraggableEvent;
