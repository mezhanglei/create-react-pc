import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import classNames from 'classnames';
import { createCSSTransform, createSVGTransform, getPositionByBounds } from './utils/dom';
import { DraggableProps, DragData, EventHandler } from "./utils/types";
import { isElementSVG } from "@/utils/verify";
import DraggableEvent from './DraggableEvent';
import { findElement, getPositionInParent } from '@/utils/dom';

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
        reset,
        ...DraggableEventProps
    } = props;

    let draggingRef = useRef<boolean>(false); // 是否正在拖拽
    const nodeRef = useRef<any>();

    const [dragged, setDragged] = useState<boolean>(false); // 是否已经拖拽过
    const [isSVG, setIsSVG] = useState<boolean>(false); // 是否为SVG元素
    const slackXRef = useRef<number>(0);
    const slackYRef = useRef<number>(0);

    const [eventData, setEventData] = useState<DragData>();
    const eventDataRef = useRef<DragData>();

    const [initX, setInitX] = useState<number>()
    const [initY, setInitY] = useState<number>()

    const axisRef = useRef<string>("both");

    const wrapClassName = "react-draggable";
    const wrapClassNameDragging = "react-draggable-dragging";
    const wrapClassNameDragged = "react-draggable-dragged";

    useImperativeHandle(ref, () => (nodeRef?.current));

    useEffect(() => {
        const node = nodeRef?.current;
        const parent = findBoundsParent();
        const position = getPositionInParent(node, parent);
        position?.x !== undefined && setInitX(position?.x);
        position?.y !== undefined && setInitY(position?.y);
    }, []);

    // 更新x,y
    useEffect(() => {
        if (x != undefined && !draggingRef.current) {
            const lastX = initX || 0;
            const newX = x || 0;
            const translateX = newX - lastX;
            eventDataUpdate(eventDataRef.current, { newX, translateX })
        }

        if (y !== undefined && !draggingRef.current) {
            const lastY = initY || 0;
            const newY = y || 0;
            const translateY = newY - lastY;
            eventDataUpdate(eventDataRef.current, { newY, translateY })
        }
        // 非拖拽引起的位置变化,则更新初始位置
        if (x !== initX && initX !== undefined && x !== undefined && !draggingRef.current && reset) {
            setInitX(x);
        }
        if (y !== initY && initY !== undefined && y !== undefined && !draggingRef.current && reset) {
            setInitY(y);
        }
    }, [x, y, initX, initY, reset, draggingRef.current]);

    // 更新axis
    useEffect(() => {
        if (props?.axis) axisRef.current = props?.axis;
    }, [props?.axis])

    const eventDataChange = (value: DragData) => {
        eventDataRef.current = value;
        setEventData(value);
    }

    const eventDataUpdate = (eventData: DragData | undefined, data: any) => {
        eventData = eventData || {
            translateX: 0,
            translateY: 0,
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

    const findOwnerDocument = () => {
        return document;
    };

    // 限制范围的父元素
    const findBoundsParent = () => {
        const ownerDocument = findOwnerDocument();
        const node = (findElement(props.bounds)) || ownerDocument?.body || ownerDocument?.documentElement;
        return node;
    };

    const onDragStart: EventHandler = (e, data) => {
        e.stopImmediatePropagation();
        if (!data) return;
        const node = data?.node;
        const parent = findBoundsParent();
        const position = getPositionInParent(node, parent);
        const x = position?.x || 0;
        const y = position?.y || 0;
        const translateX = eventDataRef.current?.translateX || 0;
        const translateY = eventDataRef.current?.translateY || 0;

        const eventData = {
            ...eventDataRef.current,
            translateX,
            translateY,
            deltaX: 0,
            deltaY: 0,
            x: x, y: y,
            lastX: x,
            lastY: y,
            zIndex: zIndexRange[1],
            node
        }

        // 如果onDragStart函数返回false则禁止拖拽
        const shouldStart = props.onDragStart && props.onDragStart(e, eventData);
        if (shouldStart === false) return;

        draggingRef.current = true;
        setDragged(true);
        setIsSVG(isElementSVG(data?.node));
        eventData && eventDataChange(eventData);
    };

    const onDrag: EventHandler = (e, data) => {
        if (!draggingRef.current || !data) return;
        let x = eventDataRef?.current?.x ?? 0;
        const y = eventDataRef?.current?.y ?? 0;
        let translateX = eventDataRef?.current?.translateX ?? 0;
        let translateY = eventDataRef?.current?.translateY ?? 0;

        const node = nodeRef?.current;
        const parent = findBoundsParent();
        const position = getPositionInParent(node, parent);

        const diffX = (position?.x || x) - x;
        const diffY = (position?.y || y) - y;

        translateX = translateX - diffX;
        translateY = translateY - diffY;

        // 拖拽生成的位置信息
        const eventData = {
            node: data.node,
            zIndex: zIndexRange[1],
            translateX: canDragX() ? (translateX + (data?.deltaX / scale)) : translateX,
            translateY: canDragY() ? (translateY + (data.deltaY / scale)) : translateY,
            x: canDragX() ? (x + (data?.deltaX / scale)) : x,
            y: canDragY() ? (y + (data.deltaY / scale)) : y,
            deltaX: (data.deltaX / scale),
            deltaY: (data.deltaY / scale),
            lastX: x,
            lastY: y
        };

        if (!eventData) return;

        let nowX = eventData?.x;
        let nowY = eventData?.y;

        // 运动边界限制
        if (bounds) {
            nowX += slackXRef.current;
            nowY += slackYRef.current;

            // 边界处理
            const node = data?.node;

            const newPosition = getPositionByBounds(node, { x: nowX, y: nowY }, bounds);
            nowX = newPosition.x;
            nowY = newPosition.y;
            const nowTranslateX = translateX + nowX - x;
            const nowTranslateY = translateY + nowY - y;

            // 重新计算越界补偿, 用来修正越界后鼠标真实的位置变化
            const newSlackX = slackXRef.current + (eventData.x - nowX);
            const newSlackY = slackYRef.current + (eventData.y - nowY);
            slackXRef.current = newSlackX;
            slackYRef.current = newSlackY;

            // 更新
            eventData.x = nowX;
            eventData.y = nowY;
            eventData.translateX = nowTranslateX;
            eventData.translateY = nowTranslateY;
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
            deltaX: 0,
            deltaY: 0,
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
    const cls = classNames((children.props?.className || ''), wrapClassName, className, {
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
        x: eventData?.translateX || 0,
        y: eventData?.translateY || 0
    };

    // React.Children.only限制只能传递一个child
    return (
        <DraggableEvent ref={nodeRef} {...DraggableEventProps} onDragStart={onDragStart} onDrag={onDrag} onDragStop={onDragStop}>
            {React.cloneElement(React.Children.only(children), {
                className: cls,
                style: {
                    ...children?.props?.style,
                    ...style,
                    transform: !isSVG ? createCSSTransform(currentPosition, positionOffset) : style?.transform ?? (children.props.style?.transform || ""),
                    zIndex: eventData?.zIndex ?? style?.zIndex ?? children?.props?.style?.zIndex
                },
                transform: isSVG ? createSVGTransform(currentPosition, positionOffset) : (props?.transform ?? (children.props?.transform || "")),
            })}
        </DraggableEvent>
    );
});

export default React.memo(Draggable);