import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import {
    DraggableAreaProps,
    DraggableAreaBuilder,
    DraggerContextInterface,
    TagInterface,
    InitPosition,
    AddTagFunc
} from "./utils/types";
import classNames from "classnames";
import { DraggerItemHandler, DraggerItemEvent } from "./dragger-item";
import { getOffsetWH, getPositionInParent } from "@/utils/dom";
import { combinedArr, getArrMap, arrayMove } from "@/utils/array";
import { produce } from "immer";

export const DraggerContext = React.createContext<DraggerContextInterface | null>(null);

// 拖拽容器
const buildDraggableArea: DraggableAreaBuilder = (areaProps) => {

    const listenAddFunc = areaProps?.listenAddFunc;
    const triggerAddFunc = areaProps?.triggerAddFunc;
    // 拖拽区域
    const DraggableArea = React.forwardRef<any, DraggableAreaProps>((props, ref) => {

        const {
            className,
            style,
            children,
            ...rest
        } = props;

        const [dragType, setDragType] = useState<'dragStart' | 'draging' | 'dragEnd' | 'resizeStart' | 'resizing' | 'resizeEnd'>();

        const parentRef = useRef<any>();
        const childNodesRef = useRef<HTMLElement[]>([]);
        const [childLayout, setChildLayout] = useState<DraggerItemEvent[]>();
        const childLayoutRef = useRef<DraggerItemEvent[]>([]);
        const initPositionRef = useRef<InitPosition[]>([]);
        const [coverChild, setCoverChild] = useState<HTMLElement>();

        useImperativeHandle(ref, () => (parentRef?.current));

        useEffect(() => {
            initChildren(childNodesRef.current);
            // 初始化监听事件
            if (listenAddFunc) {
                const area = parentRef.current;
                listenAddFunc(area, addTag);
            }
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

        // 初始化children位置信息
        const initChildren = (childNodes: HTMLElement[]) => {
            const parent = findParent();
            initPositionRef.current = [];
            const layout: DraggerItemEvent[] = [];
            childNodes?.map((item) => {
                if (item) {
                    const position = getPositionInParent(item, parent);
                    const offsetWH = getOffsetWH(item);
                    const layoutItem = {
                        node: item,
                        width: offsetWH?.width || 0,
                        height: offsetWH?.height || 0,
                        x: position?.x || 0,
                        y: position?.y || 0
                    }

                    const initPosition = {
                        width: offsetWH?.width || 0,
                        height: offsetWH?.height || 0,
                        x: position?.x || 0,
                        y: position?.y || 0
                    }
                    initPositionRef.current?.push(initPosition);
                    layout.push(layoutItem);
                }
            })
            childLayoutRef.current = layout;
            setChildLayout(layout);
        }

        // 同区域内拖拽
        const moveTrigger = (tag: TagInterface): { coverChild?: HTMLElement, dragPreIndex?: number, dragNextIndex?: number } => {
            const tagCenter = {
                x: (tag?.x || 0) + (tag?.width || 0) / 2,
                y: (tag?.y || 0) + (tag?.height || 0) / 2
            }
            let dragPreIndex = childNodesRef?.current?.findIndex((item) => item === tag.node);
            let dragNextIndex = initPositionRef?.current?.findIndex((item) => {
                const itemCenter = {
                    x: (item?.x || 0) + (item?.width || 0) / 2,
                    y: (item?.y || 0) + (item?.height || 0) / 2
                }
                if (Math.abs(tagCenter?.x - itemCenter?.x) < 20 && Math.abs(tagCenter?.y - itemCenter?.y) < 20) {
                    return true;
                }
            });
            const nextChild = childNodesRef.current?.[dragNextIndex];
            const child = nextChild && nextChild !== tag?.node ? nextChild: undefined;
            return { coverChild: child, dragPreIndex, dragNextIndex };
        }

        // 跨区域拖拽
        const crossTrigger = (tag: TagInterface): { coverChild?: HTMLElement, dragNextIndex?: number } => {
            const tagCenter = {
                x: (tag?.x || 0) + (tag?.width || 0) / 2,
                y: (tag?.y || 0) + (tag?.height || 0) / 2
            }
            let dragNextIndex = initPositionRef?.current?.findIndex((item) => {
                const itemCenter = {
                    x: (item?.x || 0) + (item?.width || 0) / 2,
                    y: (item?.y || 0) + (item?.height || 0) / 2
                }
                if (Math.abs(tagCenter?.x - itemCenter?.x) < 20 && Math.abs(tagCenter?.y - itemCenter?.y) < 20) {
                    return true;
                }
            });
            const nextChild = childNodesRef.current?.[dragNextIndex];
            const child = nextChild && tag?.area !== parentRef?.current ? nextChild: undefined;
            return { coverChild: child, dragNextIndex };
        }

        const onDragStart: DraggerItemHandler = (e, tag) => {
            if (!tag) return false;
            setDragType(tag?.dragType);
        }

        const onDrag: DraggerItemHandler = (e, tag) => {
            if (!tag) return false;
            const areaTag = { ...tag, area: parentRef.current }
            setDragType(tag.dragType);
            const { coverChild, dragNextIndex, dragPreIndex } = moveTrigger(areaTag);
            if (dragNextIndex !== undefined && dragPreIndex !== undefined && dragNextIndex > -1 && dragPreIndex > -1) {
                const moveArr = arrayMove(childLayoutRef.current, dragPreIndex,dragNextIndex);
                const moveAfterChildLayout = combinedArr(moveArr, initPositionRef.current, (item1, item2, index1, index2) => index1 === index2);
                setChildLayout(moveAfterChildLayout);
            }
            setCoverChild(coverChild)
            props?.onDragMove && props?.onDragMove(areaTag, coverChild, e);
            // 是否拖到区域外部
            if (triggerAddFunc) {
                const isTrigger = triggerAddFunc(areaTag, e);
                if (isTrigger) {
                    const triggerInfo = {
                        type: 'out',
                        area: parentRef.current,
                        moveTag: areaTag,
                        coverChild
                    }
                    props?.onChange && props?.onChange(triggerInfo);
                }
            }
        }

        const onDragEnd: DraggerItemHandler = (e, tag) => {
            if (!tag) return false;
            const areaTag = { ...tag, area: parentRef.current }
            setDragType(tag?.dragType);
            setCoverChild(undefined);
            const { coverChild, dragNextIndex, dragPreIndex } = moveTrigger(areaTag);
            props?.onDragMoveEnd && props?.onDragMoveEnd(areaTag, coverChild, e);
            // 是否拖到区域外部
            if (triggerAddFunc) {
                const isTrigger = triggerAddFunc(areaTag, e);
                if (isTrigger) {
                    const triggerInfo = {
                        type: 'out',
                        area: parentRef.current,
                        moveTag: areaTag,
                        coverChild
                    }
                    props?.onChange && props?.onChange(triggerInfo);
                }
            }
        }

        // 监听添加外部区域来的tag
        const addTag: AddTagFunc = (tag, e) => {
            const { coverChild, dragNextIndex } = crossTrigger(tag);
            if (dragNextIndex !== undefined && dragNextIndex > -1) {
                // const moveArr = produce(childLayoutRef.current, draft => {
                //     draft?.splice(dragNextIndex, 0, tag)
                // })
                // console.log(moveArr, 2222)
                // const moveAfterChildLayout = combinedArr(moveArr, initPositionRef.current, (item1, item2, index1, index2) => index1 === index2);
                // setChildLayout(moveAfterChildLayout);
            }
            if (tag?.dragType === 'dragEnd') {
                setCoverChild(undefined)
            } else {
                setCoverChild(coverChild)
            }
            const triggerInfo = {
                type: 'in',
                area: parentRef?.current,
                moveTag: tag,
                coverChild: coverChild
            }
            props.onChange && props.onChange(triggerInfo);
        }

        const onResizeStart: DraggerItemHandler = (e, tag) => {
            if (!tag) return false;
            setDragType(tag?.dragType);
        }

        const onResizing: DraggerItemHandler = (e, tag) => {
            if (!tag) return false;
            setDragType(tag?.dragType);
        }

        const onResizeEnd: DraggerItemHandler = (e, tag) => {
            setDragType(tag?.dragType);
            initChildren(childNodesRef.current);
        }

        // 监听children元素
        const listenChild = (value: HTMLElement) => {
            if (childNodesRef.current?.some((item) => item === value)) {
                childNodesRef.current = [];
                childNodesRef.current.push(value);
            } else {
                childNodesRef.current.push(value);
            }
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
                    childLayout: childLayout,
                    coverChild: coverChild,
                    zIndexRange: [2, 10]
                }}>
                    {children}
                </DraggerContext.Provider>
            </div>
        );
    });

    return DraggableArea;
}
export default buildDraggableArea