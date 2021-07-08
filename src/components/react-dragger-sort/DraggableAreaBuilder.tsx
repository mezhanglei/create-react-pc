import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import {
    DraggableAreaProps,
    DraggableAreaBuilder,
    DraggerContextInterface,
    TagInterface,
    InitPosition,
    AddTagFunc,
    DragTypes
} from "./utils/types";
import classNames from "classnames";
import { DraggerItemHandler, DraggerItemEvent } from "./dragger-item";
import { getOffsetWH, getPositionInPage } from "@/utils/dom";
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

        const [dragType, setDragType] = useState<DragTypes>();

        const parentRef = useRef<any>();
        const childNodesRef = useRef<HTMLElement[]>([]);
        const [childLayout, setChildLayout] = useState<DraggerItemEvent[]>();
        const childLayoutRef = useRef<DraggerItemEvent[]>([]);
        const initPositionRef = useRef<InitPosition[]>([]);
        const [coverChild, setCoverChild] = useState<HTMLElement>();
        const dragPreIndexRef = useRef<number>();
        const dragNextIndexRef = useRef<number>();
        const crossDragNextIndexRef = useRef<number>();

        useImperativeHandle(ref, () => (parentRef?.current));

        useEffect(() => {
            initChildren(childNodesRef.current);
            // 初始化监听事件
            if (listenAddFunc) {
                const area = parentRef.current;
                listenAddFunc(area, addTag);
            }
        }, []);

        // 初始化children位置信息
        const initChildren = (childNodes: HTMLElement[]) => {
            initPositionRef.current = [];
            const layout: DraggerItemEvent[] = [];
            childNodes?.map((item) => {
                if (item) {
                    const position = getPositionInPage(item);
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
        const moveTrigger = (tag: TagInterface): { coverChild?: HTMLElement, dragPreIndex?: number, dragNextIndex?: number } | undefined => {
            const tagCenter = {
                x: (tag?.x || 0) + (tag?.width || 0) / 2,
                y: (tag?.y || 0) + (tag?.height || 0) / 2
            }
            childLayoutRef?.current?.map((item, index) => {
                const itemCenter = {
                    x: (item?.x || 0) + (item?.width || 0) / 2,
                    y: (item?.y || 0) + (item?.height || 0) / 2
                }
                if (item?.node === tag.node) {
                    dragPreIndexRef.current = index;
                }
                if (Math.abs(tagCenter?.x - itemCenter?.x) < 20 && Math.abs(tagCenter?.y - itemCenter?.y) < 20) {
                    dragNextIndexRef.current = index;
                    return true;
                }
            });
            const nextChild = dragNextIndexRef.current !== undefined ? childLayoutRef.current?.[dragNextIndexRef.current]?.node : undefined;
            const child = nextChild && nextChild !== tag?.node ? nextChild : undefined;
            return { coverChild: child, dragPreIndex: dragPreIndexRef.current, dragNextIndex: dragNextIndexRef.current };
        }

        // 跨区域拖拽
        const crossTrigger = (tag: TagInterface): { coverChild?: HTMLElement, dragNextIndex?: number } | undefined => {
            const tagCenter = {
                x: (tag?.x || 0) + (tag?.width || 0) / 2,
                y: (tag?.y || 0) + (tag?.height || 0) / 2
            }
            childLayoutRef?.current?.map((item, index) => {
                const itemCenter = {
                    x: (item?.x || 0) + (item?.width || 0) / 2,
                    y: (item?.y || 0) + (item?.height || 0) / 2
                }
                if (Math.abs(tagCenter?.x - itemCenter?.x) < 20 && Math.abs(tagCenter?.y - itemCenter?.y) < 20) {
                    crossDragNextIndexRef.current = index;
                    return true;
                }
            });
            const nextChild = crossDragNextIndexRef.current !== undefined ? childLayoutRef.current?.[crossDragNextIndexRef.current]?.node : undefined;
            const child = nextChild && tag?.area !== parentRef?.current ? nextChild : undefined;
            return { coverChild: child, dragNextIndex: crossDragNextIndexRef.current };
        }

        // 容器内移动位置
        const updateMoving = (dragPreIndex?: number, dragNextIndex?: number, dragType?: string) => {
            if (dragNextIndex !== undefined && dragPreIndex !== undefined) {
                const moveArr = arrayMove(childLayoutRef.current, dragPreIndex, dragNextIndex);
                const moveAfterChildLayout = combinedArr(moveArr, initPositionRef.current, (item1, item2, index1, index2) => index1 === index2);
                setChildLayout(moveAfterChildLayout);
                if (dragType === 'dragEnd') {
                    childLayoutRef.current = moveAfterChildLayout;
                }
            }
        }

        const onDragStart: DraggerItemHandler = (e, tag) => {
            if (!tag) return false;
            setDragType(tag?.dragType);
        }

        const onDrag: DraggerItemHandler = (e, tag) => {
            if (!tag) return false;
            const areaTag = { ...tag, area: parentRef.current }
            setDragType(tag.dragType);
            const moveRet = moveTrigger(areaTag);
            const coverChild = moveRet?.coverChild;
            const dragNextIndex = moveRet?.dragNextIndex;
            const dragPreIndex = moveRet?.dragPreIndex;
            updateMoving(dragPreIndex, dragNextIndex, tag?.dragType)
            setCoverChild(coverChild)
            coverChild && props?.onDragMove && props?.onDragMove(areaTag, coverChild, dragPreIndex, dragNextIndex, e);
            // 是否拖到区域外部
            if (triggerAddFunc) {
                triggerAddFunc(areaTag, e);
            }
        }

        const onDragEnd: DraggerItemHandler = (e, tag) => {
            if (!tag) return false;
            const areaTag = { ...tag, area: parentRef.current }
            setDragType(tag?.dragType);
            setCoverChild(undefined);
            const moveRet = moveTrigger(areaTag);
            const coverChild = moveRet?.coverChild;
            const dragNextIndex = moveRet?.dragNextIndex;
            const dragPreIndex = moveRet?.dragPreIndex;
            updateMoving(dragPreIndex, dragNextIndex, tag?.dragType);
            props?.onDragMoveEnd && props?.onDragMoveEnd(areaTag, coverChild, dragPreIndex, dragNextIndex, e);
            // 是否拖到区域外部
            if (triggerAddFunc) {
                const isTrigger = triggerAddFunc(areaTag, e);
                if (isTrigger) {
                    if (dragPreIndex != undefined) {
                        childLayoutRef.current?.splice(dragPreIndex, 1);
                        setChildLayout(childLayoutRef.current);
                    }
                    const triggerInfo = {
                        type: 'out',
                        area: parentRef.current,
                        moveTag: areaTag,
                        coverChild,
                        dragPreIndex
                    }
                    props?.onMoveOutChange && props?.onMoveOutChange(triggerInfo);
                }
            }
        }

        // 监听添加外部区域来的tag
        const addTag: AddTagFunc = (tag, e) => {
            const moveRet = crossTrigger(tag);
            const coverChild = moveRet?.coverChild;
            const dragNextIndex = moveRet?.dragNextIndex;
            setDragType(tag?.dragType);
            if (tag?.dragType === 'draging' && dragNextIndex !== undefined) {
                // 拖拽位置
            } else if (tag?.dragType === 'dragEnd' && dragNextIndex !== undefined) {
                // 同步数据
            }

            if (tag?.dragType === 'dragEnd') {
                setCoverChild(undefined)
                const triggerInfo = {
                    type: 'in',
                    area: parentRef?.current,
                    moveTag: tag,
                    coverChild: coverChild
                }
                props.onMoveInChange && props.onMoveInChange(triggerInfo);
            } else {
                setCoverChild(coverChild)
            }
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

        // 获取所有的子元素
        const listenChild = (value: HTMLElement) => {
            childNodesRef.current.push(value);
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
                    parentDragType: dragType,
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