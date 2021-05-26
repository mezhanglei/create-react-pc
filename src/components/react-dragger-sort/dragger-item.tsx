import React, { useEffect, useRef, useState, CSSProperties, useImperativeHandle, useContext } from 'react';
import ResizeZoom from "@/components/react-resize-zoom";
import { EventType as ResizeEventType, EventHandler as ResizeEventHandler } from "@/components/react-resize-zoom/type";
import Draggable, { EventType as DragEventType, DragHandler as DragEventHandler, BoundsInterface, DragData } from "@/components/react-free-draggable";
import { ChildrenType } from "./types";
import classNames from "classnames";
import { findElement, getPositionInParent, getOffsetWH } from "@/utils/dom";
import { DraggerContext } from './DraggableAreaBuilder';
import {
    DraggerContextInterface
} from "./types";

export type EventType = MouseEvent | TouchEvent;
export type DraggerItemHandler<E = EventType, T = DraggerItemEvent> = (e: E, data: T) => void | boolean;
export interface DraggerItemEvent {
    width: number;
    height: number;
    x: number;
    y: number;
    translateX?: number;
    translateY?: number;
    id: string | number;
    node: HTMLElement;
}
export interface DraggerProps extends DraggerContextInterface {
    children: ChildrenType;
    className?: string;
    style?: CSSProperties;
    onDragStart?: DraggerItemHandler;
    onDrag?: DraggerItemHandler;
    onDragEnd?: DraggerItemHandler;
    onResizeStart?: DraggerItemHandler;
    onResizing?: DraggerItemHandler;
    onResizeEnd?: DraggerItemHandler;
    id: string | number;
    type?: 'drag' | 'resize' | 'both' | 'none'; // 允许操作的类型
    width?: number; // 宽度
    height?: number; // 高度
    x?: number;
    y?: number;
    dragNode?: string;
}

// 拖拽及缩放组件
const DraggerItem = React.forwardRef<any, DraggerProps>((props, ref) => {

    const {
        children,
        className,
        style,
        type = "both",
        id,
        dragNode
    } = props;

    const [dragType, setDragType] = useState<'dragStart' | 'draging' | 'dragEnd' | 'resizeStart' | 'resizing' | 'resizeEnd'>();
    const [x, setX] = useState<number>();
    const [y, setY] = useState<number>();
    const [width, setWidth] = useState<number>();
    const [height, setHeight] = useState<number>();
    const [isOver, setIsOver] = useState<boolean>();

    const context = useContext(DraggerContext)

    const zIndexRange = context?.zIndexRange ?? props?.zIndexRange;
    const isReflow = context?.isReflow ?? props?.isReflow;
    const bounds = context?.bounds ?? props?.bounds;
    const childLayOut = context?.childLayOut ?? props?.childLayOut;
    const coverChild = context?.coverChild ?? props?.coverChild;
    const itemLayOut = childLayOut?.[id];
    const listenChild = context?.listenChild ?? props?.listenChild;
    const nodeRef = useRef<any>();

    useImperativeHandle(ref, () => ({
        node: nodeRef?.current
    }));

    useEffect(() => {
        const x = props?.x ?? itemLayOut?.x;
        x != undefined && setX(x);
    }, [props?.x, itemLayOut?.x])

    useEffect(() => {
        const y = props?.y ?? itemLayOut?.y;
        y !== undefined && setY(y);
    }, [props?.y, itemLayOut?.y])

    useEffect(() => {
        const width = props?.width ?? itemLayOut?.width;
        width != undefined && setWidth(width);
    }, [props?.width, itemLayOut?.width])

    useEffect(() => {
        const height = props?.height ?? itemLayOut?.height;
        height !== undefined && setHeight(height);
    }, [props?.height, itemLayOut?.height]);

    // 监听children是否重绘从而重新初始化获取node
    useEffect(() => {
        const node = nodeRef.current;
        listenChild && listenChild({ node, id });
    }, [children]);

    useEffect(() => {
        if (coverChild?.id === id) {
            setIsOver(true)
        } else {
            setIsOver(false)
        }
    }, [coverChild])

    // 可以拖拽
    const canDrag = () => {
        return ['drag', 'both']?.includes(type)
    }

    // 可以调整尺寸
    const canResize = () => {
        return ['resize', 'both']?.includes(type)
    }

    const findOwnerDocument = () => {
        return document;
    };

    // 限制范围的父元素
    const findBoundsParent = () => {
        const ownerDocument = findOwnerDocument();
        const node = (findElement(bounds)) || ownerDocument?.body || ownerDocument?.documentElement;
        return node;
    };

    const onDragStart: DragEventHandler = (e, data) => {
        if (!data || !canDrag()) return false;
        setDragType('dragStart');
        const node = data?.node;
        const offsetWH = getOffsetWH(node);
        if (!offsetWH) return false;
        return context?.onDragStart && context?.onDragStart(e, {
            width: offsetWH?.width,
            height: offsetWH?.height,
            translateX: data?.translateX,
            translateY: data?.translateY,
            x: data?.x,
            y: data?.y,
            id: id,
            node: node
        });
    }

    const onDrag: DragEventHandler = (e, data) => {
        if (!data || !canDrag()) return false;
        const node = data?.node;
        setDragType('draging');
        const offsetWH = getOffsetWH(node);
        if (!offsetWH) return false;
        return context?.onDrag && context?.onDrag(e, {
            width: offsetWH?.width,
            height: offsetWH?.height,
            translateX: data?.translateX,
            translateY: data?.translateY,
            x: data?.x,
            y: data?.y,
            id: id,
            node: node
        });
    }

    const onDragStop: DragEventHandler = (e, data) => {
        if (!data || !canDrag()) return false;
        setDragType('dragEnd');
        const node = data?.node;
        const offsetWH = getOffsetWH(node);
        if (!offsetWH) return false;
        return context?.onDragEnd && context?.onDragEnd(e, {
            width: offsetWH?.width,
            height: offsetWH?.height,
            translateX: data?.translateX,
            translateY: data?.translateY,
            x: data?.x,
            y: data?.y,
            id: id,
            node: node
        });
    }

    const onResizeStart: ResizeEventHandler = (e, data) => {
        if (!data || !canResize()) return false;
        setDragType('resizeStart');
        const node = data?.node;
        const parent = findBoundsParent();
        const position = getPositionInParent(node, parent);
        return context?.onResizeStart && context?.onResizeStart(e, {
            width: data?.width,
            height: data?.height,
            x: position?.x || 0,
            y: position?.y || 0,
            id: id,
            node: node
        })
    }

    const onResizing: ResizeEventHandler = (e, data) => {
        if (!data || !canResize()) return false;
        const node = data?.node;
        setDragType('resizing');
        const parent = findBoundsParent();
        const position = getPositionInParent(node, parent);
        return context?.onResizing && context?.onResizing(e, {
            width: data?.width,
            height: data?.height,
            x: position?.x || 0,
            y: position?.y || 0,
            id: id,
            node: node
        })
    }

    const onResizeEnd: ResizeEventHandler = (e, data) => {
        if (!data || !canResize()) return false;
        setDragType('resizeEnd');
        const node = data?.node;
        const parent = findBoundsParent();
        const position = getPositionInParent(node, parent);
        return context?.onResizeEnd && context?.onResizeEnd(e, {
            width: data?.width,
            height: data?.height,
            x: position?.x || 0,
            y: position?.y || 0,
            id: id,
            node: node
        });
    }

    const cls = classNames((children?.props?.className || ''), className);

    return (
        <Draggable
            ref={nodeRef}
            className={cls}
            onDragStart={onDragStart}
            onDrag={onDrag}
            onDragStop={onDragStop}
            bounds={bounds}
            dragNode={dragNode}
            isReflow={isReflow}
            x={x}
            y={y}
        >
            <ResizeZoom
                onResizeStart={onResizeStart}
                onResizeMoving={onResizing}
                onResizeEnd={onResizeEnd}
                width={width}
                height={height}
            >
                {
                    React.cloneElement(React.Children.only(children), {
                        style: {
                            ...children.props.style,
                            ...style,
                            opacity: isOver ? '0.8' : (style?.opacity || children?.props?.style?.opacity),
                            transition: (!dragType || dragType !== 'dragEnd' && dragType !== 'resizeEnd') && (canDrag() || canResize()) ? '' : 'all .2s ease-out',
                            zIndex: zIndexRange && ((!dragType || (dragType === 'resizeEnd' || dragType === 'dragEnd')) ? zIndexRange[0] : zIndexRange[1])
                        }
                    })
                }
            </ResizeZoom>
        </Draggable>
    );
});


export default DraggerItem;