import React, { useEffect, useRef, useState, CSSProperties, useImperativeHandle, useContext } from 'react';
import ResizeZoom from "@/components/react-resize-zoom";
import { EventHandler as ResizeEventHandler, DirectionCode } from "@/components/react-resize-zoom/type";
import Draggable, { DragHandler as DragEventHandler, DragAxisCode } from "@/components/react-free-draggable";
import { ChildrenType, ChildTypes, DraggerContextInterface, DragTypes } from "./utils/types";
import classNames from "classnames";
import { getInsidePosition, getOffsetWH } from "@/utils/dom";
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
    node: HTMLElement;
    dragType?: `${DragTypes}`;
    id: string | number;
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
    dragAxis?: string[]; // 拖拽位置
    resizeAxis?: string[]; // 拖拽大小
    handle?: string | HTMLElement;
    id: string | number;
}

// 拖拽及缩放组件
const DraggerItem = React.forwardRef<any, DraggerProps>((props, ref) => {

    const {
        children,
        className,
        style,
        dragAxis = DragAxisCode,
        resizeAxis = [],
        handle,
        id
    } = props;

    const [dragType, setDragType] = useState<`${DragTypes}`>();
    const context = useContext(DraggerContext)

    const zIndexRange = context?.zIndexRange ?? props?.zIndexRange;
    const parentDragType = context?.parentDragType ?? props?.parentDragType;
    const coverChild = context?.coverChild ?? props?.coverChild;
    const listenChild = context?.listenChild ?? props?.listenChild;
    const nodeRef = useRef<any>();
    const [node, setNode] = useState<any>();

    useImperativeHandle(ref, () => ({
        node: nodeRef?.current
    }));

    useEffect(() => {
        const node = nodeRef.current;
        setNode(node);
        listenChild && listenChild({ node, id });
    }, []);

    const isOver = (coverChild?: ChildTypes) => {
        if (coverChild?.node === node) {
            return true;
        } else {
            return false;
        }
    }

    // 可以拖拽
    const canDrag = () => {
        return DragAxisCode?.some((axis) => dragAxis?.includes(axis))
    }

    // 可以调整尺寸
    const canResize = () => {
        const canUse = DirectionCode?.some((dir) => resizeAxis?.includes(dir));
        return canUse;
    }

    const onDragStart: DragEventHandler = (e, data) => {
        if (!data || !canDrag()) return false;
        setDragType(DragTypes.dragStart);
        const node = data?.node;
        const offsetWH = getOffsetWH(node);
        if (!offsetWH) return false;
        return context?.onDragStart && context?.onDragStart(e, {
            width: offsetWH?.width,
            height: offsetWH?.height,
            translateX: data?.translateX,
            translateY: data?.translateY,
            x: data?.x || 0,
            y: data?.y || 0,
            node: node,
            dragType: DragTypes.dragStart,
            id
        });
    }

    const onDrag: DragEventHandler = (e, data) => {
        if (!data || !canDrag()) return false;
        const node = data?.node;
        setDragType(DragTypes.draging);
        const offsetWH = getOffsetWH(node);
        if (!offsetWH) return false;
        return context?.onDrag && context?.onDrag(e, {
            width: offsetWH?.width,
            height: offsetWH?.height,
            translateX: data?.translateX,
            translateY: data?.translateY,
            x: data?.x || 0,
            y: data?.y || 0,
            node: node,
            dragType: DragTypes.draging,
            id
        });
    }

    const onDragStop: DragEventHandler = (e, data) => {
        if (!data || !canDrag()) return false;
        setDragType(DragTypes.dragEnd);
        const node = data?.node;
        const offsetWH = getOffsetWH(node);
        if (!offsetWH) return false;
        return context?.onDragEnd && context?.onDragEnd(e, {
            width: offsetWH?.width,
            height: offsetWH?.height,
            translateX: data?.translateX,
            translateY: data?.translateY,
            x: data?.x || 0,
            y: data?.y || 0,
            node: node,
            dragType: DragTypes.dragEnd,
            id
        });
    }

    const onResizeStart: ResizeEventHandler = (e, data) => {
        if (!data || !canResize()) return false;
        setDragType(DragTypes.resizeStart);
        const node = data?.node;
        const position = getInsidePosition(node);
        return context?.onResizeStart && context?.onResizeStart(e, {
            width: data?.width,
            height: data?.height,
            x: position?.left || 0,
            y: position?.top || 0,
            node: node,
            dragType: DragTypes.resizeStart,
            id
        })
    }

    const onResizing: ResizeEventHandler = (e, data) => {
        if (!data || !canResize()) return false;
        const node = data?.node;
        setDragType(DragTypes.resizing);
        const position = getInsidePosition(node);
        return context?.onResizing && context?.onResizing(e, {
            width: data?.width,
            height: data?.height,
            x: position?.left || 0,
            y: position?.top || 0,
            node: node,
            dragType: DragTypes.resizing,
            id
        })
    }

    const onResizeEnd: ResizeEventHandler = (e, data) => {
        if (!data || !canResize()) return false;
        setDragType(DragTypes.resizeEnd);
        const node = data?.node;
        const position = getInsidePosition(node);
        return context?.onResizeEnd && context?.onResizeEnd(e, {
            width: data?.width,
            height: data?.height,
            x: position?.left || 0,
            y: position?.top || 0,
            node: node,
            dragType: DragTypes.resizeEnd,
            id
        });
    }

    const cls = classNames((children?.props?.className || ''), className);

    // 可拖拽子元素
    const NormalItem = (
        <Draggable
            ref={nodeRef}
            className={cls}
            axis={dragAxis}
            onDragStart={onDragStart}
            onDrag={onDrag}
            onDragStop={onDragStop}
            handle={handle}
            reset={!parentDragType || !([DragTypes.dragStart, DragTypes.draging] as string[])?.includes(parentDragType)}
            x={0}
            y={0}
        >
            <ResizeZoom
                onResizeStart={onResizeStart}
                onResizeMoving={onResizing}
                onResizeEnd={onResizeEnd}
                axis={resizeAxis}
            >
                {
                    React.cloneElement(React.Children.only(children), {
                        style: {
                            ...children.props.style,
                            ...style,
                            opacity: isOver(coverChild) ? '0.8' : (style?.opacity || children?.props?.style?.opacity),
                            transition: dragType && ([DragTypes.dragStart, DragTypes.draging] as string[]).includes(dragType) || parentDragType === DragTypes.dragEnd ? '' : 'all .2s ease-out',
                            zIndex: dragType && ([DragTypes.dragStart, DragTypes.draging] as string[]).includes(dragType) ? zIndexRange?.[1] : zIndexRange?.[0]
                        }
                    })
                }
            </ResizeZoom>
        </Draggable>
    );

    return NormalItem;
});


export default DraggerItem;