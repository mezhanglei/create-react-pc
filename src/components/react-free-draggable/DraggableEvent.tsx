import React, { useEffect, useRef } from 'react';
import { matchParent, addEvent, removeEvent, getPositionInParent, findElement } from "@/utils/dom";
import { addUserSelectStyles, removeUserSelectStyles, snapToGrid } from "./utils/dom";
import { isNumber } from "@/utils/type";
import { isMobile, isEventTouch } from "@/utils/verify";
import { DraggableEventProps, EventHandler, PositionInterface, EventType } from "./utils/types";

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

// 拖拽事件组件
const DraggableEvent: React.FC<DraggableEventProps> = (props) => {

    const {
        children,
        onStart,
        onDrag,
        onStop,
        allowAnyClick,
        disabled,
        enableUserSelectHack,
        grid
    } = props;

    let draggingRef = useRef<boolean>(false);
    let lastXRef = useRef<number>(NaN);
    let lastYRef = useRef<number>(NaN);
    const nodeRef = useRef<any>();

    // 顶层document对象（有的环境可能删除了document顶层环境）
    const findOwnerDocument = () => {
        const node = nodeRef?.current;
        return node.ownerDocument;
    };

    // 拖拽节点
    const findDragNode = () => {
        const node = props.dragNode && findElement(props.dragNode) || nodeRef?.current;
        const nodeStyle = node?.ownerDocument?.defaultView?.getComputedStyle(node);
        if (nodeStyle?.display === "inline") {
            throw new Error("the style of `props.children` or `dragNode` cannot is `inline`, because `transform` has no effect on Element ");
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
        const node = (props.boundsParent && findElement(props.boundsParent)) || ownerDocument?.body || ownerDocument?.documentElement;
        return node;
    };

    useEffect(() => {
        return () => {
            const ownerDocument = findOwnerDocument();
            removeEvent(ownerDocument, dragEventFor.move, handleDrag);
            removeEvent(ownerDocument, dragEventFor.stop, handleDragStop);
            // 移除选中样式
            if (enableUserSelectHack) removeUserSelectStyles(ownerDocument);
        };
    }, []);

    // 返回拖拽位置信息
    const createEventData = (x: number, y: number): PositionInterface => {
        const dragNode = findDragNode();

        if (isNumber(lastXRef.current)) {
            return {
                node: dragNode,
                // 移动一次的距离
                deltaX: x - lastXRef.current,
                deltaY: y - lastYRef.current,
                // 拖拽前位置
                lastX: lastXRef.current, lastY: lastYRef.current,
                x, y
            };
        } else {
            return {
                node: dragNode,
                deltaX: 0,
                deltaY: 0,
                lastX: x,
                lastY: y,
                x, y
            };
        }
    };

    const handleDragStart: EventHandler<EventType> = (e) => {
        const dragNode = findDragNode();
        const disabledNode = findDisabledNode();
        const boundsParent = findBoundsParent();
        const ownerDocument = findOwnerDocument();
        e.preventDefault();

        if (!ownerDocument) {
            throw new Error('<DraggableEvent> not mounted on DragStart!');
        }

        // pc端鼠标操作时允许非左键操作
        if (!allowAnyClick && !isEventTouch(e) && typeof e.button === 'number' && e.button !== 0) return false;
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
        const eventData = createEventData(x, y);

        // 如果没有完成渲染或者返回false则禁止拖拽
        const shouldUpdate = onStart && onStart(e, eventData);
        if (shouldUpdate === false) return;

        // 滚动过程中选中文本被添加样式
        if (enableUserSelectHack) addUserSelectStyles(ownerDocument);

        draggingRef.current = true;
        lastXRef.current = x;
        lastYRef.current = y;

        addEvent(ownerDocument, dragEventFor.move, handleDrag);
        addEvent(ownerDocument, dragEventFor.stop, handleDragStop);
    };

    const handleDrag: EventHandler<EventType> = (e) => {
        const boundsParent = findBoundsParent();
        e.preventDefault();
        // 获取在指定父元素内的位置
        let { x, y } = boundsParent && getPositionInParent(e, boundsParent) || {};

        // 拖拽跳跃,可设置多少幅度跳跃一次
        if (Array.isArray(grid)) {
            let deltaX = x - lastXRef.current, deltaY = y - lastYRef.current;
            [deltaX, deltaY] = snapToGrid(grid, deltaX, deltaY);
            if (!deltaX && !deltaY) return; // skip useless drag
            x = lastXRef.current + deltaX, y = lastYRef.current + deltaY;
        }

        // 返回事件对象相关的位置信息
        const eventData = createEventData(x, y);

        // 返回false则禁止拖拽并初始化鼠标事件
        const shouldUpdate = onDrag && onDrag(e, eventData);
        if (shouldUpdate === false) {
            try {
                handleDragStop(new MouseEvent('mouseup'));
            } catch (err) {
                // 兼容废弃版本
                const event = document.createEvent('MouseEvents');
                event.initMouseEvent('mouseup', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                handleDragStop(event);
            }
            return;
        }

        lastXRef.current = x;
        lastYRef.current = y;
    };

    const handleDragStop: EventHandler<EventType> = (e) => {
        if (!draggingRef.current) return;
        e.preventDefault();
        const boundsParent = findBoundsParent();
        const ownerDocument = findOwnerDocument();
        // 获取在指定父元素内的位置
        const { x, y } = boundsParent && getPositionInParent(e, boundsParent) || {};
        const eventData = createEventData(x, y);

        const shouldContinue = onStop && onStop(e, eventData);
        if (shouldContinue === false) return false;

        // 移除文本因滚动造成的显示
        if (ownerDocument) {
            // Remove user-select hack
            if (enableUserSelectHack) removeUserSelectStyles(ownerDocument);
        }

        // 重置
        draggingRef.current = false;
        lastXRef.current = NaN;
        lastYRef.current = NaN;

        if (ownerDocument) {
            removeEvent(ownerDocument, dragEventFor.move, handleDrag);
            removeEvent(ownerDocument, dragEventFor.stop, handleDragStop);
        }
    };

    return React.cloneElement(React.Children.only(children), {
        onMouseDown: handleDragStart,
        onTouchStart: handleDragStart,
        onMouseUp: handleDragStop,
        onTouchEnd: handleDragStop,
        ref: nodeRef
    });
};

export default DraggableEvent;
