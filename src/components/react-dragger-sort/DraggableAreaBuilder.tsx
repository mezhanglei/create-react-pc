import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import {
    DraggableAreaProps,
    DraggableAreaBuilder,
    PlaceholderProps,
    DraggerContextInterface,
    DraggerChildNodes,
    TagInterface
} from "./types";
import classNames from "classnames";
import DraggerItem, { DraggerItemHandler, DraggerItemEvent } from "./dragger-item";
import { findElement, getOffsetWH, getPositionInParent } from "@/utils/dom";
import { changeLocation, findInArray } from "@/utils/array";
import produce from 'immer'

export const DraggerContext = React.createContext<DraggerContextInterface | null>(null);

// 拖拽容器
const buildDraggableArea: DraggableAreaBuilder = (areaProps) => {

    // 拖拽区域
    const DraggableArea = React.forwardRef<any, DraggableAreaProps>((props, ref) => {

        const {
            className,
            style,
            placeholder = true,
            children,
            ...rest
        } = props;

        const [dragType, setDragType] = useState<'dragStart' | 'draging' | 'dragEnd' | 'resizeStart' | 'resizing' | 'resizeEnd'>();

        const parentRef = useRef<any>();
        const childNodesRef = useRef<DraggerChildNodes[]>([]);
        const [childLayOut, setChildLayOut] = useState<{ [key: string]: DraggerItemEvent }>({});
        const [coverChild, setCoverChild] = useState<DraggerChildNodes>();

        const [placeholderData, setPlaceholderData] = useState<PlaceholderProps>();
        const placeholderDataRef = useRef<PlaceholderProps>()

        useImperativeHandle(ref, () => (parentRef?.current));

        const placeholderDataChange = (val: PlaceholderProps) => {
            setPlaceholderData(val);
            placeholderDataRef.current = val;
        }

        useEffect(() => {
            setChildLayOutFunc(childNodesRef.current);
        }, []);

        const findOwnerDocument = () => {
            return document;
        };

        // 父元素
        const findParent = () => {
            const ownerDocument = findOwnerDocument();
            const node = ownerDocument?.body || ownerDocument?.documentElement;
            return node;
        };

        // 设置子元素的位置以及宽高
        const setChildLayOutFunc = (childNodes: DraggerChildNodes[]): DraggerChildNodes | {} => {
            const parent = findParent();
            const pos: any = {};
            childNodes?.map((item) => {
                if (item?.node) {
                    const position = getPositionInParent(item?.node, parent);
                    const offsetWH = getOffsetWH(item?.node);
                    pos[item?.id] = {
                        id: item?.id,
                        node: item?.node,
                        width: offsetWH?.width,
                        height: offsetWH?.height,
                        x: position?.x,
                        y: position?.y
                    }
                }
            })
            setChildLayOut(pos);
            return pos;
        }

        // 根据当前拖拽元素和其他所有的子元素比较，如果存在接近的元素，则返回
        const moveTrigger = (tag: DraggerItemEvent, childNodes: DraggerChildNodes[]): DraggerChildNodes | undefined => {
            const parent = findParent();
            const tagCenter = {
                x: tag?.x + tag?.width / 2,
                y: tag?.y + tag?.height / 2
            }
            const child = findInArray(childNodes, (item) => {
                const position = getPositionInParent(item?.node, parent);
                const offsetWH = getOffsetWH(item?.node);
                if (offsetWH && position && item?.id !== tag?.id) {
                    const itemCenter = {
                        x: position?.x + offsetWH?.width / 2,
                        y: position?.y + offsetWH?.height / 2
                    }

                    if (Math.abs(tagCenter?.x - itemCenter?.x) < 20 && Math.abs(tagCenter?.y - itemCenter?.y) < 20) {
                        return true;
                    }
                }
            });
            return child;
        }

        const onDragStart: DraggerItemHandler = (e, tag) => {
            if (!tag) return false;
            setDragType('dragStart');
            placeholderDataChange({
                x: tag?.x,
                y: tag?.y,
                width: tag?.width,
                height: tag?.height
            })
        }

        const onDrag: DraggerItemHandler = (e, tag) => {
            if (!tag) return false;
            setDragType('draging');
            const coverChild = moveTrigger(tag, childNodesRef.current);
            setCoverChild(coverChild)
            props?.onDragMove && props?.onDragMove(tag, coverChild, e);
        }

        const onDragEnd: DraggerItemHandler = (e, tag) => {
            if (!tag) return false;
            setDragType('dragEnd');
            setCoverChild(undefined);
            const coverChild = moveTrigger(tag, childNodesRef.current);
            props?.onDragMoveEnd && props?.onDragMoveEnd(tag, coverChild, e);
        }

        const onResizeStart: DraggerItemHandler = (e, tag) => {
            if (!tag) return false;
            setDragType('resizeStart');
        }

        const onResizing: DraggerItemHandler = (e, tag) => {
            if (!tag) return false;
            setDragType('resizing');
        }

        const onResizeEnd: DraggerItemHandler = (e, tag) => {
            setDragType('resizeEnd');
            setChildLayOutFunc(childNodesRef.current);
        }

        // 监听children元素
        const listenChild = (value: DraggerChildNodes) => {
            if (childNodesRef.current?.some((item) => item?.id === value?.id)) {
                childNodesRef.current = [];
                childNodesRef.current.push(value);
            } else {
                childNodesRef.current.push(value);
            }
        }

        const renderPlaceholder = () => {
            if (!dragType || !['dragStart', 'draging']?.includes(dragType)) return;
            return (
                <DraggerItem
                    onDragStart={onDragStart}
                    onDrag={onDrag}
                    onDragEnd={onDragEnd}
                    onResizeStart={onResizeStart}
                    onResizing={onResizing}
                    onResizeEnd={onResizeEnd}
                    x={placeholderData?.x}
                    y={placeholderData?.y}
                    width={placeholderData?.width}
                    height={placeholderData?.height}
                    id={-1}
                    zIndexRange={[1, 9]}
                    style={{
                        position: 'absolute',
                        background: 'green',
                        transition: ' all .15s ease-out'
                    }}
                >
                    <div />
                </DraggerItem>
            )
        }

        const cls = classNames('DraggerLayout', className);

        return (
            <div
                className={cls}
                ref={parentRef}
                style={{
                    ...style,
                    zIndex: 1
                }}
            >
                <DraggerContext.Provider value={{
                    onDragStart,
                    onDrag,
                    onDragEnd,
                    onResizeStart,
                    onResizing,
                    onResizeEnd,
                    listenChild: listenChild,
                    isReflow: !dragType || !['dragStart', 'draging', 'dragEnd']?.includes(dragType),
                    childLayOut: childLayOut,
                    coverChild: coverChild,
                    zIndexRange: [2, 10]
                }}>
                    {children}
                </DraggerContext.Provider>
                {renderPlaceholder()}
            </div>
        );
    });

    return DraggableArea;
}
export default buildDraggableArea