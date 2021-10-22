import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import classNames from 'classnames';
import { createCSSTransform, createSVGTransform, getPositionByBounds } from './utils/dom';
import { DraggableProps, DragData, EventHandler, PositionType, DragAxis, BoundsInterface, EventData } from "./utils/types";
import { isElementSVG } from "@/utils/verify";
import DraggableEvent from './DraggableEvent';
import { findElement, getInsidePosition } from '@/utils/dom';
import ReactDOM from 'react-dom';

/**
 * 拖拽组件-回调处理(通过transform来控制元素拖拽, 不影响页面布局)
 */
const Draggable = React.forwardRef<any, DraggableProps>((props, ref) => {

    const {
        children,
        x,
        y,
        scale = 1,
        axis = DragAxis.both,
        positionOffset,
        bounds,
        zIndexRange = [],
        reset,
        className,
        style,
        ...DraggableEventProps
    } = props;

    let draggingRef = useRef<boolean>(false); // 是否正在拖拽
    const nodeRef = useRef<any>();

    const [dragged, setDragged] = useState<boolean>(false); // 是否已经拖拽过
    const [isSVG, setIsSVG] = useState<boolean>(false); // 是否为SVG元素
    const slackXRef = useRef<number>(0);
    const slackYRef = useRef<number>(0);

    const [eventData, setEventData] = useState<DragData>({
        translateX: 0,
        translateY: 0,
        deltaX: 0,
        deltaY: 0
    });

    // 拖拽的初始位置
    const [initXY, setInitXY] = useState<PositionType>();

    const wrapClassName = "react-draggable";
    const wrapClassNameDragging = "react-draggable-dragging";
    const wrapClassNameDragged = "react-draggable-dragged";

    useImperativeHandle(ref, () => (findDOMNode()));

    const findDOMNode = () => {
        return nodeRef?.current || ReactDOM.findDOMNode(this);
    }

    // 获取定位父元素，涉及的位置相对于该父元素
    const getLocationParent = () => {
        const parent = findElement(bounds) || findElement((bounds as BoundsInterface)?.boundsParent) || document.body || document.documentElement;
        return parent;
    }

    useEffect(() => {
        const child = findDOMNode();
        const parent = getLocationParent();
        const pos = getInsidePosition(child, parent);
        const initXY = pos && {
            x: pos?.left,
            y: pos?.top
        };
        initXY && setInitXY(initXY);
        if (initXY) {
            setEventData({
                ...eventData,
                lastX: initXY?.x,
                lastY: initXY?.y
            });
        }
    }, [bounds]);

    // 更新x,y
    useEffect(() => {
        if (x !== undefined && y !== undefined && initXY && !draggingRef.current) {
            const lastX = initXY?.x;
            const lastY = initXY?.y;
            // 初始化传值时根据限制重新计算该值
            const newX = x;
            const newY = y;
            const translateX = newX - lastX;
            const translateY = newY - lastY;
            setEventData(data => ({
                ...data,
                x: newX,
                y: newY,
                lastX: newX,
                lastY: newY,
                translateX,
                translateY
            }))
        }
        if (x !== undefined && y !== undefined && reset) {
            setInitXY({ x, y });
        }
    }, [x, y, initXY?.x, initXY?.y, reset, bounds, draggingRef.current]);

    const onDragStart: EventHandler = (e, data) => {
        e.stopImmediatePropagation();
        if (!data) return;
        const node = data?.node;
        const parent = getLocationParent();
        const pos = getInsidePosition(node, parent);
        let positionX = pos?.left;
        let positionY = pos?.top;

        const translateX = eventData?.translateX || 0;
        const translateY = eventData?.translateY || 0;

        const newEventData = {
            ...eventData,
            translateX,
            translateY,
            deltaX: 0,
            deltaY: 0,
            x: positionX, y: positionY,
            lastX: positionX,
            lastY: positionY,
            zIndex: zIndexRange[1],
            node
        }

        draggingRef.current = true;
        setDragged(true);
        setIsSVG(isElementSVG(data?.node));
        setEventData(newEventData)
        props.onDragStart && props.onDragStart(e, newEventData);
    };

    const onDrag: EventHandler = (e, data) => {
        if (!draggingRef.current || !data) return;
        let x = eventData?.x ?? 0;
        const y = eventData?.y ?? 0;
        let translateX = eventData?.translateX ?? 0;
        let translateY = eventData?.translateY ?? 0;

        // 拖拽生成的位置信息
        const newEventData = {
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

        if (!newEventData) return;

        let nowX = newEventData?.x;
        let nowY = newEventData?.y;

        // 运动边界限制
        if (bounds) {
            nowX += slackXRef.current;
            nowY += slackYRef.current;

            // 边界处理
            const node = data?.node;

            const newPositionXY = getPositionByBounds(node, { x: nowX, y: nowY }, bounds);
            nowX = newPositionXY.x;
            nowY = newPositionXY.y;
            const nowTranslateX = translateX + nowX - x;
            const nowTranslateY = translateY + nowY - y;

            // 重新计算越界补偿, 用来修正越界后鼠标真实的位置变化
            const newSlackX = slackXRef.current + (newEventData.x - nowX);
            const newSlackY = slackYRef.current + (newEventData.y - nowY);
            slackXRef.current = newSlackX;
            slackYRef.current = newSlackY;

            // 更新
            newEventData.x = nowX;
            newEventData.y = nowY;
            newEventData.translateX = nowTranslateX;
            newEventData.translateY = nowTranslateY;
            newEventData.deltaX = nowX - (eventData?.x || 0);
            newEventData.deltaY = nowY - (eventData?.y || 0);
        }

        // eventData && eventDataChange(eventData);
        setEventData(newEventData);
        props.onDrag && props.onDrag(e, newEventData);
    };

    const onDragStop: EventHandler = (e, data) => {
        if (!draggingRef.current || !eventData) return;

        const newEventData = {
            ...eventData,
            deltaX: 0,
            deltaY: 0,
            zIndex: zIndexRange[0]
        }
        draggingRef.current = false;
        slackXRef.current = 0;
        slackYRef.current = 0;
        setEventData(newEventData);
        props.onDragStop && props.onDragStop(e, newEventData);
    };


    // 包裹元素的className
    const cls = classNames((children.props?.className || ''), wrapClassName, className, {
        [wrapClassNameDragging]: draggingRef.current,
        [wrapClassNameDragged]: dragged
    });

    const canDragX = () => {
        return axis === DragAxis.both || axis === DragAxis.x;
    };

    const canDragY = () => {
        return axis === DragAxis.both || axis === DragAxis.y;
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