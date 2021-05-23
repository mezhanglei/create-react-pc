import React, { useEffect, useRef, useState, CSSProperties, useImperativeHandle, useContext } from 'react';
import ResizeZoom from "@/components/react-resize-zoom";
import { EventType as ResizeEventType, EventHandler as ResizeEventHandler } from "@/components/react-resize-zoom/type";
import Draggable, { EventType as DragEventType, DragHandler as DragEventHandler, BoundsInterface, DragData } from "@/components/react-free-draggable";
import { ChildrenType } from "./types";
import classNames from "classnames";
import { findElement, getPositionInParent, getOffsetWH } from "@/utils/dom";
import { DraggerContext } from './DraggableAreaBuilder';

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
export interface DraggerProps {
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
    bounds?: string | HTMLElement | BoundsInterface;
    type?: 'drag' | 'resize' | 'both' | 'none'; // 允许操作的类型
    width?: number; // 宽度
    height?: number; // 高度
    x?: number;
    y?: number;
    zIndexRange?: [number, number];
    dragNode?: string;
    parentRef?: any;
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

    const context = useContext(DraggerContext)

    const zIndexRange = context?.zIndexRange ?? props?.zIndexRange;
    const parentRef = context?.parentRef ?? props?.parentRef;
    const bounds = context?.bounds ?? props?.bounds;
    const childLayOut = context?.childLayOut && context?.childLayOut[id];
    const initChild = context?.initChild;
    const nodeRef = useRef<any>();

    useImperativeHandle(ref, () => ({
        node: nodeRef?.current
    }));

    useEffect(() => {
        const x = props?.x ?? childLayOut?.x;
        x != undefined && setX(x);
    }, [props?.x, childLayOut?.x])

    useEffect(() => {
        const y = props?.y ?? childLayOut?.y;
        y !== undefined && setY(y);
    }, [props?.y, childLayOut?.y])

    useEffect(() => {
        const width = props?.width ?? childLayOut?.width;
        width != undefined && setWidth(width);
    }, [props?.width, childLayOut?.width])

    useEffect(() => {
        const height = props?.height ?? childLayOut?.height;
        height !== undefined && setHeight(height);
    }, [props?.height, childLayOut?.height]);

    useEffect(() => {
        const node = nodeRef.current;
        const parent = findBoundsParent();
        const position = getPositionInParent(node, parent);
        const offsetWH = getOffsetWH(node);
        const x = position?.x || 0;
        const y = position?.y || 0;
        const width = offsetWH?.width || 0;
        const height = offsetWH?.height || 0;
        initChild && initChild({ node, id, x, y, width, height });
    }, []);

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