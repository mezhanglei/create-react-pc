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
import { combinedArr, getArrMap } from "@/utils/array";
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

        // useEffect(() => {
        //     if(dragNextIndexRef.current !== undefined && dragPreIndexRef.current !== undefined && dragNextIndexRef.current > -1 && dragPreIndexRef.current > -1) {
        //         const newchild = produce(childLayout, draft => {
        //             draft?.splice(dragNextIndexRef.current + 1, 0, draft?.[dragPreIndexRef.current]);
        //         })
        //         const newchild2 = produce(newchild, draft => {
        //             draft?.splice(dragPreIndexRef.current, 1);
        //         })
        //         // childLayout?.splice(dragPreIndexRef.current, 1);
        //         const newarr = combinedArr(newchild2, initPositionRef.current, (item1,item2, index1, index2) => index1 === index2);
        //         setChildLayout(newarr)
        //     } 
        // }, [dragPreIndexRef.current, dragNextIndexRef.current])

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
            const parent = findParent();
            const tagCenter = {
                x: (tag?.x || 0) + (tag?.width || 0) / 2,
                y: (tag?.y || 0) + (tag?.height || 0) / 2
            }
            let dragPreIndex;
            let dragNextIndex;
            const child = childNodesRef?.current?.find((item, index) => {
                const position = getPositionInParent(item, parent);
                const offsetWH = getOffsetWH(item);
                if (item === tag?.node) {
                    dragPreIndex = index;
                }
                if (offsetWH && position && (item !== tag?.node || tag?.area !== parentRef?.current)) {
                    const itemCenter = {
                        x: position?.x + offsetWH?.width / 2,
                        y: position?.y + offsetWH?.height / 2
                    }

                    if (Math.abs(tagCenter?.x - itemCenter?.x) < 20 && Math.abs(tagCenter?.y - itemCenter?.y) < 20) {
                        dragNextIndex = index;
                        return true;
                    }
                }
            });
            return { coverChild: child, dragPreIndex, dragNextIndex };
        }

        // 跨区域拖拽
        const crossTrigger = (tag: TagInterface): { coverChild?: HTMLElement, dragNextIndex?: number } => {
            const parent = findParent();
            const tagCenter = {
                x: (tag?.x || 0) + (tag?.width || 0) / 2,
                y: (tag?.y || 0) + (tag?.height || 0) / 2
            }
            let dragNextIndex;
            const child = childNodesRef?.current?.find((item, index) => {
                const position = getPositionInParent(item, parent);
                const offsetWH = getOffsetWH(item);
                if (offsetWH && position && (item !== tag?.node || tag?.area !== parentRef?.current)) {
                    const itemCenter = {
                        x: position?.x + offsetWH?.width / 2,
                        y: position?.y + offsetWH?.height / 2
                    }

                    if (Math.abs(tagCenter?.x - itemCenter?.x) < 20 && Math.abs(tagCenter?.y - itemCenter?.y) < 20) {
                        dragNextIndex = index;
                        return true;
                    }
                }
            });
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
                if(dragNextIndex !== undefined && dragPreIndex !== undefined) {
                const newchild = produce(childLayoutRef.current, draft => {
                    if(dragNextIndex === 0) {
                        draft?.splice(dragNextIndex, 0, draft?.[dragPreIndex]);
                    } else {
                        draft?.splice(dragNextIndex + 1, 0, draft?.[dragPreIndex]);
                    }  
                })
                const newchild2 = produce(newchild, draft => {
                    draft?.splice(dragPreIndex, 1);
                });
                const newarr = combinedArr(newchild2, initPositionRef.current, (item1,item2, index1, index2) => index1 === index2);
                console.log(coverChild, 111)
                setChildLayout(newarr)
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