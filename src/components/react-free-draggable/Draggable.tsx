import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { createCSSTransform, createSVGTransform, getPositionByBounds } from './utils/dom';
import { DraggableProps, PositionInterface, DragHandler, EventType } from "./utils/types";
import { isElementSVG } from "@/utils/verify";
import { findElement } from "@/utils/dom";
import DraggableEvent from './DraggableEvent';

/**
 * 拖拽组件-回调处理(通过transform来控制元素拖拽, 不影响页面布局)
 */
const Draggable: React.FC<DraggableProps> = (props) => {

    const {
        children,
        scale = 1,
        axis = "both",
        position,
        positionOffset,
        bounds,
        ...DraggableEventProps
    } = props;

    let draggingRef = useRef<boolean>(false); // 是否正在拖拽

    const [dragged, setDragged] = useState<boolean>(false); // 是否已经拖拽过
    const [isSVG, setIsSVG] = useState<boolean>(false); // 是否为SVG元素
    const xRef = useRef<number>(0);
    const yRef = useRef<number>(0);
    const [x, setX] = useState<number>(0);
    const [y, setY] = useState<number>(0);
    const slackXRef = useRef<number>(0);
    const slackYRef = useRef<number>(0);

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

    useEffect(() => {
        if (position) {
            xRef.current = position?.x || 0;
            yRef.current = position?.y || 0;
        }
    }, [position]);

    const xChange = (value: number) => {
        xRef.current = value;
        setX(value);
    }

    const yChange = (value: number) => {
        yRef.current = value;
        setY(value);
    }

    const createDraggableData = (eventData: PositionInterface): PositionInterface => {
        return {
            node: eventData.node,
            x: xRef.current + (eventData.deltaX / scale),
            y: yRef.current + (eventData.deltaY / scale),
            deltaX: (eventData.deltaX / scale),
            deltaY: (eventData.deltaY / scale),
            lastX: xRef.current,
            lastY: yRef.current
        };
    };

    const onDragStart: DragHandler<EventType> = (e, data) => {
        // 如果onStart函数返回false则禁止拖拽
        const shouldStart = props.onStart && props.onStart(e, createDraggableData(data));
        if (shouldStart === false) return false;

        draggingRef.current = true;
        setDragged(true);
        setIsSVG(isElementSVG(data?.node));
    };

    const onDrag: DragHandler<EventType> = (e, data) => {
        if (!draggingRef.current) return false;

        // 拖拽生成的位置信息
        const initData = createDraggableData(data);

        let nowX = initData?.x;
        let nowY = initData?.y;

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
            const newSlackX = slackXRef.current + (initData.x - nowX);
            const newSlackY = slackYRef.current + (initData.y - nowY);
            slackXRef.current = newSlackX;
            slackYRef.current = newSlackY;

            // 更新
            initData.x = nowX;
            initData.y = nowY;
            initData.deltaX = nowX - xRef.current;
            initData.deltaY = nowY - yRef.current;
        }

        const shouldUpdate = props.onDrag && props.onDrag(e, initData);
        if (shouldUpdate === false) return false;
        xChange(nowX);
        yChange(nowY);
    };

    const onDragStop: DragHandler<EventType> = (e, data) => {
        if (!draggingRef.current) return false;

        // Short-circuit if user's callback killed it.
        const shouldContinue = props.onStop && props.onStop(e, createDraggableData(data));
        if (shouldContinue === false) return false;

        // 如果是受控组件,则需要重置位置为最近一次的position
        if (position) {
            xRef.current = position?.x;
            yRef.current = position?.y;
        }

        draggingRef.current = false;
        slackXRef.current = 0;
        slackYRef.current = 0;
    };


    // 包裹元素的className
    const cls = classNames((children.props.className || ''), wrapClassName, {
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
        // Set left if horizontal drag is enabled
        x: canDragX() && draggingRef?.current ? x : (position?.x || 0),
        // Set top if vertical drag is enabled
        y: canDragY() && draggingRef?.current ? y : (position?.y || 0)
    };

    // React.Children.only限制只能传递一个child
    // 注意使用时, 子元素最好用闭合标签包裹, 以防出现props带来的问题(例如style样式中的transition和transform, 以及事件)
    return (
        <DraggableEvent {...DraggableEventProps} onStart={onDragStart} onDrag={onDrag} onStop={onDragStop}>
            {React.cloneElement(React.Children.only(children), {
                className: cls,
                style: { ...children.props.style, ...(!isSVG && createCSSTransform(currentPosition, positionOffset) || {}) },
                transform: isSVG && createSVGTransform(currentPosition, positionOffset) || "",
            })}
        </DraggableEvent>
    );
};

export default Draggable;

