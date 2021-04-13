import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { createCSSTransform, createSVGTransform, getPositionByBounds } from './utils/dom';
import { DraggableProps, EventData, EventHandler } from "./utils/types";
import { isElementSVG } from "@/utils/verify";
import { findElement } from "@/utils/dom";
import DraggableEvent from './DraggableEvent';
import { filterObject } from "@/utils/object";

/**
 * 拖拽组件-回调处理(通过transform来控制元素拖拽, 不影响页面布局)
 */
const Draggable = React.forwardRef<any, DraggableProps>((props, ref) => {

    const {
        children,
        x,
        y,
        scale = 1,
        positionOffset,
        bounds,
        zIndexRange = [],
        className,
        style,
        ...DraggableEventProps
    } = props;

    let draggingRef = useRef<boolean>(false); // 是否正在拖拽

    const [dragged, setDragged] = useState<boolean>(false); // 是否已经拖拽过
    const [isSVG, setIsSVG] = useState<boolean>(false); // 是否为SVG元素
    const slackXRef = useRef<number>(0);
    const slackYRef = useRef<number>(0);

    const [eventData, setEventData] = useState<EventData>();
    const eventDataRef = useRef<EventData>();

    const axisRef = useRef<string>("both");

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

    // 更新x,y
    useEffect(() => {
        if (x != undefined && !draggingRef.current) {
            eventDataUpdate(eventDataRef.current, { lastX: x, x: x })
        }
        if (y != undefined && !draggingRef.current) {
            eventDataUpdate(eventDataRef.current, { lastY: y, y: y })
        }
    }, [x, y, draggingRef.current]);

    // 更新axis
    useEffect(() => {
        axisRef.current = props?.axis;
    }, [props?.axis])

    const eventDataChange = (value: EventData) => {
        eventDataRef.current = value;
        setEventData(value);
    }

    const eventDataUpdate = (eventData: EventData | undefined, data: any) => {
        eventData = eventData || {
            deltaX: 0,
            deltaY: 0,
            x: 0, y: 0,
            lastX: 0,
            lastY: 0
        }
        const value = { ...eventData, ...data };
        eventDataRef.current = value;
        setEventData(value);
    }

    const onDragStart: EventHandler = (e, data) => {
        e.stopImmediatePropagation();
        if (!data) return;
        // 如果onDragStart函数返回false则禁止拖拽
        const shouldStart = props.onDragStart && props.onDragStart(e, data);
        if (shouldStart === false) return;

        draggingRef.current = true;
        setDragged(true);
        setIsSVG(isElementSVG(data?.node));
    };

    const onDrag: EventHandler = (e, data) => {
        if (!draggingRef.current || !data) return;

        const x = eventDataRef?.current?.x ?? 0;
        const y = eventDataRef?.current?.y ?? 0;
        const lastX = eventDataRef?.current?.lastX ?? 0;
        const lastY = eventDataRef?.current?.lastY ?? 0;

        // 拖拽生成的位置信息
        const eventData = {
            node: data.node,
            zIndex: zIndexRange[1],
            x: canDragX() ? (x + (data?.deltaX / scale)) : lastX,
            y: canDragY() ? y + (data.deltaY / scale) : lastY,
            deltaX: (data.deltaX / scale),
            deltaY: (data.deltaY / scale),
            lastX: x,
            lastY: y
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

            // 重新计算越界补偿, 用来修正越界后鼠标真实的位置变化
            const newSlackX = slackXRef.current + (eventData.x - nowX);
            const newSlackY = slackYRef.current + (eventData.y - nowY);
            slackXRef.current = newSlackX;
            slackYRef.current = newSlackY;

            // 更新
            eventData.x = nowX;
            eventData.y = nowY;
            eventData.deltaX = nowX - (eventDataRef.current?.x || 0);
            eventData.deltaY = nowY - (eventDataRef.current?.y || 0);
        }

        const shouldUpdate = props.onDrag && props.onDrag(e, eventData);
        if (shouldUpdate === false) return;
        eventData && eventDataChange(eventData);
    };

    const onDragStop: EventHandler = (e, data) => {
        if (!draggingRef.current || !eventDataRef.current) return;

        eventDataRef.current = {
            ...eventDataRef.current,
            zIndex: zIndexRange[0]
        }

        // Short-circuit if user's callback killed it.
        const shouldContinue = props.onDragStop && props.onDragStop(e, eventDataRef.current);
        if (shouldContinue === false) return;

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
        return axisRef.current === 'both' || axisRef.current === 'x';
    };

    const canDragY = () => {
        return axisRef.current === 'both' || axisRef.current === 'y';
    };

    // 当前位置
    const currentPosition = {
        x: eventData?.x || 0,
        y: eventData?.y || 0
    };
    
    // React.Children.only限制只能传递一个child
    return (
        <DraggableEvent ref={ref} {...DraggableEventProps} onDragStart={onDragStart} onDrag={onDrag} onDragStop={onDragStop}>
            {React.cloneElement(React.Children.only(children), {
                className: cls,
                style: {
                    ...filterObject(children.props.style, (item) => item != undefined),
                    ...filterObject(style, (item) => item != undefined),
                    ...(
                        !isSVG ? createCSSTransform(currentPosition, positionOffset)
                            :
                            {
                                transform: style?.transform ?? (children.props.style?.transform || "")
                            }
                    ),
                    zIndex: eventData?.zIndex ?? style?.zIndex ?? children.props.style?.zIndex
                },
                transform: isSVG ? createSVGTransform(currentPosition, positionOffset) : (props?.transform ?? (children.props?.transform || "")),
            })}
        </DraggableEvent>
    );
});

export default Draggable;

