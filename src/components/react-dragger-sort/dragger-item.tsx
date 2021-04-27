import React, { useEffect, useRef, useState, CSSProperties, useImperativeHandle } from 'react';
import ResizeZoom from "@/components/react-resize-zoom";
import { EventType as ResizeEventType, EventHandler as ResizeEventHandler } from "@/components/react-resize-zoom/type";
import Draggable, { EventType as DragEventType, DragHandler as DragEventHandler, BoundsInterface } from "@/components/react-free-draggable";
import { ChildrenType } from "./types";
import classNames from "classnames";
import { findElement,getPositionInParent, getClientWH } from "@/utils/dom";

export type EventType = MouseEvent | TouchEvent;
export type DraggerItemHandler<E = EventType, T = DraggerItemEvent> = (e: E, data: T) => void | boolean;
export interface DraggerItemEvent {
    width: number;
    height: number;
    x: number;
    y: number;
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
}

// 拖拽及缩放组件
const DraggerItem = React.forwardRef<any, DraggerProps>((props, ref) => {

    const {
        children,
        className,
        style,
        type = "both",
        bounds,
        id,
        width,
        height,
        x,
        y,
        zIndexRange
    } = props;

    const [dragType, setDragType] = useState<'drag' | 'resize' | 'none'>();

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
        const node = (findElement(props.bounds)) || ownerDocument?.body || ownerDocument?.documentElement;
        return node;
    };

    const onDragStart: DragEventHandler = (e, data) => {
        if (!data || !canDrag()) return false;
        setDragType('drag');
        const node = data?.node;
        const clientWH = getClientWH(node);
        if (!clientWH) return false;
        return props.onDragStart && props.onDragStart(e, {
            width: clientWH?.width,
            height: clientWH?.height,
            x: data?.x,
            y: data?.y,
            id: id,
            node: node
        });
    }

    const onDrag: DragEventHandler = (e, data) => {
        if (!data || !canDrag()) return false;
        const node = data?.node;
        const clientWH = getClientWH(node);
        if (!clientWH) return false;
        return props.onDrag && props.onDrag(e, {
            width: clientWH?.width,
            height: clientWH?.height,
            x: data?.x,
            y: data?.y,
            id: id,
            node: node
        });
    }

    const onDragStop: DragEventHandler = (e, data) => {
        if (!data || !canDrag()) return false;
        setDragType('none');
        const node = data?.node;
        const clientWH = getClientWH(node);
        if (!clientWH) return false;
       return props.onDragEnd && props.onDragEnd(e, {
            width: clientWH?.width,
            height: clientWH?.height,
            x: data?.x,
            y: data?.y,
            id: id,
            node: node
        });
    }

    const onResizeStart: ResizeEventHandler = (e, data) => {
        if (!data || !canResize()) return false;
        setDragType('resize');
        const node = data?.node;
        const parent = findBoundsParent();
        const position = getPositionInParent(node, parent);
        return props.onResizeStart && props.onResizeStart(e, {
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
        const parent = findBoundsParent();
        const position = getPositionInParent(node, parent);
        return props.onResizing && props.onResizing(e, {
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
        setDragType('none');
        const node = data?.node;
        const parent = findBoundsParent();
        const position = getPositionInParent(node, parent);
        return props.onResizeEnd && props.onResizeEnd(e, {
            width: data?.width,
            height: data?.height,
            x: position?.x || 0,
            y: position?.y || 0,
            id: id,
            node: node
        });
    }

    const cls = classNames((children?.props?.className || ''), className);
console.log(x,y)
    return (
        <Draggable
            ref={ref}
            className={cls}
            onDragStart={onDragStart}
            onDrag={onDrag}
            onDragStop={onDragStop}
            bounds={bounds}
            x={x}
            y={y}
            zIndexRange={zIndexRange}
        >
            <ResizeZoom
                onResizeStart={onResizeStart}
                onResizeMoving={onResizing}
                onResizeEnd={onResizeEnd}
                width={width}
                height={height}
                zIndexRange={zIndexRange}
            >
                {
                    React.cloneElement(React.Children.only(children), {
                        style: {
                            ...children.props.style,
                            ...style,
                            transition: (!dragType || dragType != 'none') && (canDrag() || canResize()) ? '' : 'all .2s ease-out',
                            // zIndex: (!dragType || dragType != 'none') && (canDrag() || canResize()) ? (dragType === 'drag' ? 10 : 2) : 2
                        }
                    })
                }
            </ResizeZoom>
        </Draggable>
    );
});


export default DraggerItem;