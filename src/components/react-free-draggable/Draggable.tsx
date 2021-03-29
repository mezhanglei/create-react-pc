import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { createCSSTransform, createSVGTransform, getPositionByBounds } from './utils/dom';
import { DraggableProps, EventData, DragHandler, EventType } from "./utils/types";
import { isElementSVG } from "@/utils/verify";
import { findElement } from "@/utils/dom";
import DraggableEvent from './DraggableEvent';
import { getPrefixStyle } from "@/utils/cssPrefix";

/**
 * 拖拽组件-回调处理(通过transform来控制元素拖拽, 不影响页面布局)
 */
const Draggable = React.forwardRef<any, DraggableProps>((props, ref) => {

    const {
        children,
        scale = 1,
        axis = "both",
        position,
        positionOffset,
        bounds,
        zIndexRange = [1, 10],
        className,
        style,
        ...DraggableEventProps
    } = props;

    const defaultData = {
        deltaX: 0,
        deltaY: 0,
        x: 0, y: 0,
        lastX: 0,
        lastY: 0,
        zIndex: zIndexRange[0]
    }

    let draggingRef = useRef<boolean>(false); // 是否正在拖拽

    const [dragged, setDragged] = useState<boolean>(false); // 是否已经拖拽过
    const [isSVG, setIsSVG] = useState<boolean>(false); // 是否为SVG元素
    const slackXRef = useRef<number>(0);
    const slackYRef = useRef<number>(0);

    const [eventData, setEventData] = useState<EventData>(defaultData);
    const eventDataRef = useRef<EventData>(defaultData);

    const wrapClassName = "react-draggable";
    const wrapClassNameDragging = "react-draggable-dragging";
    const wrapClassNameDragged = "react-draggable-dragged";

    // 限制范围的父元素
    const findBoundsParent = () => {
        const { boundsParent } = DraggableEventProps;
        const ownerDocument = boundsParent && findElement(boundsParent);
        const node = (boundsParent && findElement(boundsParent)) || ownerDocument?.body || ownerDocument?.documentElement;
        return node;
    };

    // 初始化数据
    useEffect(() => {
        const x = position?.x || 0;
        const y = position?.y || 0;
        const data = {
            deltaX: 0,
            deltaY: 0,
            x, y,
            lastX: x,
            lastY: y,
            zIndex: zIndexRange[0]
        }
        eventDataChange(data);
    }, [position]);

    const eventDataChange = (value: EventData) => {
        eventDataRef.current = value;
        setEventData(value);
    }

    const onDragStart: DragHandler<EventType> = (e, data) => {

        // 如果onDragStart函数返回false则禁止拖拽
        const shouldStart = props.onDragStart && props.onDragStart(e, data);
        if (shouldStart === false) return false;

        draggingRef.current = true;
        setDragged(true);
        setIsSVG(isElementSVG(data?.node));
    };

    const onDrag: DragHandler<EventType> = (e, data) => {
        if (!draggingRef.current || !data) return false;

        // 拖拽生成的位置信息
        const eventData = {
            node: data.node,
            zIndex: zIndexRange[1],
            x: eventDataRef?.current?.x + (data?.deltaX / scale),
            y: eventDataRef?.current?.y + (data.deltaY / scale),
            deltaX: (data.deltaX / scale),
            deltaY: (data.deltaY / scale),
            lastX: eventDataRef?.current?.x,
            lastY: eventDataRef?.current?.y
        };

        if (!eventData) return;

        let nowX = eventData?.x;
        let nowY = eventData?.y;

        // 运动边界限制
        if (bounds || DraggableEventProps.boundsParent) {
            nowX += slackXRef.current;
            nowY += slackYRef.current;

            // 边界处理
            const node = data?.node;
            const parent = findBoundsParent();

            const newPosition = getPositionByBounds(node, parent, { x: nowX, y: nowY }, bounds);
            nowX = newPosition.x;
            nowY = newPosition.y;

            // 重新计算越界补偿
            const newSlackX = slackXRef.current + (eventData.x - nowX);
            const newSlackY = slackYRef.current + (eventData.y - nowY);
            slackXRef.current = newSlackX;
            slackYRef.current = newSlackY;

            // 更新
            eventData.x = nowX;
            eventData.y = nowY;
            eventData.deltaX = nowX - eventDataRef.current?.x;
            eventData.deltaY = nowY - eventDataRef.current?.y;
        }

        const shouldUpdate = props.onDrag && props.onDrag(e, eventData);
        if (shouldUpdate === false) return false;

        eventData && eventDataChange(eventData);
    };

    const onDragStop: DragHandler<EventType> = (e) => {
        if (!draggingRef.current || !eventDataRef.current) return false;

        eventDataRef.current = {
            ...eventDataRef.current,
            zIndex: zIndexRange[0]
        }

        // Short-circuit if user's callback killed it.
        const shouldContinue = props.onDragStop && props.onDragStop(e, eventDataRef.current);
        if (shouldContinue === false) return false;

        draggingRef.current = false;
        slackXRef.current = 0;
        slackYRef.current = 0;

        eventDataRef.current && eventDataChange(eventDataRef.current);
    };


    // 包裹元素的className
    const cls = classNames((children.props.className || ''), wrapClassName, className, {
        [wrapClassNameDragging]: draggingRef.current,
        [wrapClassNameDragged]: dragged
    });

    const canDragX = () => {
        return axis === 'both' || axis === 'x';
    };

    const canDragY = () => {
        return axis === 'both' || axis === 'y';
    };

    // 当前位置
    const currentPosition = {
        x: canDragX() && eventData ? eventData.x : 0,
        y: canDragY() && eventData ? eventData.y : 0
    };

    // React.Children.only限制只能传递一个child
    // 注意使用时, 子元素最好用闭合标签包裹, 以防出现props带来的问题(例如style样式中的transition和transform, 以及事件)
    return (
        <DraggableEvent ref={ref} {...DraggableEventProps} onDragStart={onDragStart} onDrag={onDrag} onDragStop={onDragStop}>
            {React.cloneElement(React.Children.only(children), {
                className: cls,
                style: {
                    ...children.props.style,
                    ...style,
                    ...(
                        !isSVG ? createCSSTransform(currentPosition, positionOffset)
                        :
                        {
                            [getPrefixStyle('transform')]: children.props[getPrefixStyle('transform')] || ""
                        }
                        ),
                    zIndex: eventData?.zIndex ?? children.props.zIndex
                },
                transform: isSVG ? createSVGTransform(currentPosition, positionOffset) : (children.props[getPrefixStyle('transform')] || ""),
            })}
        </DraggableEvent>
    );
});

export default Draggable;

