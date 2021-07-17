import React, { useEffect, useRef, useState, CSSProperties, useImperativeHandle, useContext } from 'react';
import ResizeZoom from "@/components/react-resize-zoom";
import { EventType as ResizeEventType, EventHandler as ResizeEventHandler, Axis } from "@/components/react-resize-zoom/type";
import Draggable, { EventType as DragEventType, DragHandler as DragEventHandler, AxisType } from "@/components/react-free-draggable";
import { ChildrenType, ChildTypes, DraggerContextInterface, DragTypes } from "./utils/types";
import classNames from "classnames";
import { findElement, getPositionInPage, getOffsetWH, setStyle, getClientXY } from "@/utils/dom";
import { DraggerContext } from './DraggableAreaBuilder';
import ReactDOM from 'react-dom';

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
    dragAxis?: `${AxisType}`; // 拖拽位置
    resizeAxis?: `${Axis}`; // 拖拽大小
    width?: number; // 宽度
    height?: number; // 高度
    x?: number;
    y?: number;
    dragNode?: string | HTMLElement;
    id: string | number;
}

// 拖拽及缩放组件
const DraggerItem = React.forwardRef<any, DraggerProps>((props, ref) => {

    const {
        children,
        className,
        style,
        dragAxis = AxisType.both,
        resizeAxis = Axis.NONE,
        dragNode,
        id
    } = props;

    const [dragType, setDragType] = useState<`${DragTypes}`>();
    const [x, setX] = useState<number>();
    const [y, setY] = useState<number>();
    const [width, setWidth] = useState<number>();
    const [height, setHeight] = useState<number>();

    const context = useContext(DraggerContext)

    const zIndexRange = context?.zIndexRange ?? props?.zIndexRange;
    const parentDragType = context?.parentDragType ?? props?.parentDragType;
    const childLayout = context?.childLayout ?? props?.childLayout;
    const coverChild = context?.coverChild ?? props?.coverChild;
    const listenChild = context?.listenChild ?? props?.listenChild;
    const nodeRef = useRef<any>();
    const draggerRef = useRef<any>();

    useImperativeHandle(ref, () => ({
        node: nodeRef?.current
    }));

    const itemLayout = () => {
        const child = childLayout?.find((item) => item?.node === nodeRef.current)
        return child;
    }

    useEffect(() => {
        const x = props?.x ?? itemLayout()?.x;
        x != undefined && setX(x);
    }, [props?.x, itemLayout()?.x])

    useEffect(() => {
        const y = props?.y ?? itemLayout()?.y;
        y !== undefined && setY(y);
    }, [props?.y, itemLayout()?.y])

    useEffect(() => {
        const width = props?.width ?? itemLayout()?.width;
        width != undefined && setWidth(width);
    }, [props?.width, itemLayout()?.width])

    useEffect(() => {
        const height = props?.height ?? itemLayout()?.height;
        height !== undefined && setHeight(height);
    }, [props?.height, itemLayout()?.height]);

    useEffect(() => {
        const node = nodeRef.current;
        listenChild && listenChild({ node, id });
    }, []);

    const isOver = (coverChild?: ChildTypes) => {
        if (coverChild?.node === nodeRef.current) {
            return true;
        } else {
            return false;
        }
    }

    // 可以拖拽
    const canDrag = () => {
        return !([AxisType.none] as string[])?.includes(dragAxis)
    }

    // 可以调整尺寸
    const canResize = () => {
        return !([Axis.NONE] as string[])?.includes(resizeAxis)
    }

    const findOwnerDocument = () => {
        return document;
    };

    // 位置相对比较的父元素
    const findParent = () => {
        const ownerDocument = findOwnerDocument();
        const node = ownerDocument?.body || ownerDocument?.documentElement;
        return node;
    };

    useEffect(() => {
        return () => {
            draggerRef.current?.parentNode?.removeChild(draggerRef.current);
        }
    }, [])

    const onDragStart: DragEventHandler = (e, data) => {
        if (!data || !canDrag()) return false;
        setDragType(DragTypes.dragStart);
        const node = data?.node;
        const offsetWH = getOffsetWH(node);
        const clientXY = getClientXY(node);
        const parent = findParent();
        const ownerDocument = findOwnerDocument();
        const div = ownerDocument.createElement('div');
        parent?.appendChild(div);
        ReactDOM.render(DragCopyItem, div);
        setStyle({
            boxSizing: 'border-box',
            height: `${offsetWH?.height}px`,
            left: `${clientXY?.x}px`,
            pointerEvents: 'none',
            position: 'fixed',
            top: `${clientXY?.y}px`,
            width: `${offsetWH?.width}px`,
            opacity: '0.8',
            zIndex: zIndexRange?.[1]
        }, draggerRef.current);
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
        const clientXY = getClientXY(node);
        setStyle({
            boxSizing: 'border-box',
            height: `${offsetWH?.height}px`,
            left: `${clientXY?.x}px`,
            pointerEvents: 'none',
            position: 'fixed',
            top: `${clientXY?.y}px`,
            width: `${offsetWH?.width}px`,
            opacity: '0.8',
            zIndex: zIndexRange?.[1]
        }, draggerRef.current);
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
        draggerRef.current?.parentNode?.removeChild(draggerRef.current);
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
        const position = getPositionInPage(node);
        return context?.onResizeStart && context?.onResizeStart(e, {
            width: data?.width,
            height: data?.height,
            x: position?.x || 0,
            y: position?.y || 0,
            node: node,
            dragType: DragTypes.resizeStart,
            id
        })
    }

    const onResizing: ResizeEventHandler = (e, data) => {
        if (!data || !canResize()) return false;
        const node = data?.node;
        setDragType(DragTypes.resizing);
        const position = getPositionInPage(node);
        return context?.onResizing && context?.onResizing(e, {
            width: data?.width,
            height: data?.height,
            x: position?.x || 0,
            y: position?.y || 0,
            node: node,
            dragType: DragTypes.resizing,
            id
        })
    }

    const onResizeEnd: ResizeEventHandler = (e, data) => {
        if (!data || !canResize()) return false;
        setDragType(DragTypes.resizeEnd);
        const node = data?.node;
        const position = getPositionInPage(node);
        return context?.onResizeEnd && context?.onResizeEnd(e, {
            width: data?.width,
            height: data?.height,
            x: position?.x || 0,
            y: position?.y || 0,
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
            dragNode={dragNode}
            reset={!parentDragType || !([DragTypes.dragStart, DragTypes.draging] as string[])?.includes(parentDragType)}
            // x={0} // 设置0只提供拖拽能力，不会进行碰撞计算，适合复杂的数据源渲染的界面
            // y={0}
            x={x}
            y={y}
        >
            <ResizeZoom
                onResizeStart={onResizeStart}
                onResizeMoving={onResizing}
                onResizeEnd={onResizeEnd}
                axis={resizeAxis}
                width={width}
                height={height}
            >
                {
                    React.cloneElement(React.Children.only(children), {
                        style: {
                            ...children.props.style,
                            ...style,
                            opacity: dragType && ([DragTypes.dragStart, DragTypes.draging] as string[]).includes(dragType) ? '0' : isOver(coverChild) ? '0.8' : (style?.opacity || children?.props?.style?.opacity),
                            transition: dragType && ([DragTypes.dragStart, DragTypes.draging] as string[]).includes(dragType) || parentDragType === DragTypes.dragEnd ? '' : 'all .2s ease-out',
                            zIndex: dragType && ([DragTypes.dragStart, DragTypes.draging] as string[]).includes(dragType) ? zIndexRange?.[1] : zIndexRange?.[0]
                        }
                    })
                }
            </ResizeZoom>
        </Draggable>
    );

    // 子元素动态生成的拖拽显示副本
    const DragCopyItem = React.cloneElement(React.Children.only(children), {
        className: cls,
        ref: (node: any) => draggerRef.current = node,
        style: {
            ...children.props.style,
            ...style
        }
    });

    return NormalItem;
});


export default DraggerItem;