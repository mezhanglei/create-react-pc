import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import {
    DraggableAreaProps,
    DraggableAreaBuilder,
    DraggerContextInterface,
    TagInterface,
    listenEventFunc,
    DragTypes,
    ChildTypes,
    ChildLayout
} from "./utils/types";
import classNames from "classnames";
import { DraggerItemHandler } from "./dragger-item";
import { getOffsetWH, getPositionInPage } from "@/utils/dom";
import { combinedArr, getArrMap, arrayMove } from "@/utils/array";
import { produce } from "immer";

export const DraggerContext = React.createContext<DraggerContextInterface | null>(null);

// 拖拽容器
const buildDraggableArea: DraggableAreaBuilder = (areaProps) => {

    const listenFunc = areaProps?.listenFunc;
    const triggerFunc = areaProps?.triggerFunc;
    // 拖拽区域
    const DraggableArea = React.forwardRef<any, DraggableAreaProps>((props, ref) => {

        const {
            className,
            style,
            children,
            dataSource,
            ...rest
        } = props;

        const [dragType, setDragType] = useState<`${DragTypes}`>();

        const parentRef = useRef<any>();
        const initChildrenRef = useRef<ChildTypes[]>([]);
        const [childLayout, setChildLayout] = useState<ChildLayout[]>();
        const childLayoutRef = useRef<ChildLayout[]>([]);
        const [coverChild, setCoverChild] = useState<ChildLayout>();
        const coverChildRef = useRef<ChildLayout>();
        const crossCoverChildRef = useRef<ChildLayout>();

        useImperativeHandle(ref, () => (parentRef?.current));

        // 数据源变化则初始化拖拽子元素位置信息
        useEffect(() => {
            if (dataSource) {
                initChildren(initChildrenRef.current);
            }
        }, [dataSource]);

        // 初始化监听事件
        useEffect(() => {
            // 初始化监听事件
            if (listenFunc) {
                const area = parentRef.current;
                listenFunc(area, AddEvent, noAddEvent);
            }
        }, []);

        // 初始化children位置信息
        const initChildren = (childs: ChildTypes[]) => {
            const layout: ChildLayout[] = [];
            childs?.map((item) => {
                if (item) {
                    const position = getPositionInPage(item?.node);
                    const offsetWH = getOffsetWH(item?.node);
                    const layoutItem = {
                        id: item?.id,
                        node: item?.node,
                        width: offsetWH?.width || 0,
                        height: offsetWH?.height || 0,
                        x: position?.x || 0,
                        y: position?.y || 0
                    }
                    layout.push(layoutItem);
                }
            })
            childLayoutRef.current = layout;
            setChildLayout(layout);
        }

        // 同区域内拖拽
        const moveTrigger = (tag: TagInterface): ChildLayout | undefined => {
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
                    coverChildRef.current = item;
                    return true;
                }
            });
            return coverChildRef.current;
        }

        // 跨区域拖拽
        const crossTrigger = (tag: TagInterface): ChildLayout | undefined => {
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
                    crossCoverChildRef.current = item;
                    return true;
                }
            });
            return crossCoverChildRef.current;
        }

        // 碰撞移动位置
        const impactMoving = (moveTag?: TagInterface, coverChild?: ChildLayout) => {
            if (moveTag && coverChild) {
                // const moveArr = arrayMove(childLayoutRef.current, dragPreIndex, dragNextIndex);

                // const moveMinIndex = Math.min(dragPreIndex, dragNextIndex)
                // moveArr?.map((item, index) => {
                //     console.log(moveMinIndex, 22222)
                //     if (dragPreIndex > dragNextIndex) {
                //         console.log()
                //     }
                //     else if (dragPreIndex < dragNextIndex) {

                //     }
                // });
                // setChildLayout(moveAfterChildLayout);
                if (moveTag?.dragType === DragTypes.dragEnd) {
                    // childLayoutRef.current = moveAfterChildLayout;
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
            const coverChild = moveTrigger(areaTag);
            impactMoving(areaTag, coverChild);
            setCoverChild(coverChild)
            coverChild && props?.onDragMove && props?.onDragMove(areaTag, coverChild, e);
            // 是否拖到区域外部
            if (triggerFunc) {
                triggerFunc(areaTag, e);
            }
        }

        const onDragEnd: DraggerItemHandler = (e, tag) => {
            if (!tag) return false;
            const areaTag = { ...tag, area: parentRef.current }
            setDragType(tag?.dragType);
            setCoverChild(undefined);
            const coverChild = moveTrigger(areaTag);
            impactMoving(areaTag, coverChild);
            props?.onDragMoveEnd && props?.onDragMoveEnd(areaTag, coverChild, e);
            // 是否拖到区域外部
            if (triggerFunc) {
                const isTrigger = triggerFunc(areaTag, e);
                if (isTrigger) {
                    if (areaTag) {
                        childLayoutRef.current = childLayoutRef.current?.filter((item) => item?.id !== areaTag?.id);
                        setChildLayout(childLayoutRef.current);
                    }
                    const triggerInfo = {
                        area: parentRef.current,
                        moveTag: areaTag
                    }
                    props?.onMoveOutChange && props?.onMoveOutChange(triggerInfo);
                }
            }
        }

        // 拖拽外部元素进入当前区域内的事件
        const AddEvent: listenEventFunc = (tag, e) => {
            const coverChild = crossTrigger(tag);
            setDragType(tag?.dragType);
            if (tag?.dragType === DragTypes.draging && coverChild) {
                // 拖拽位置
            } else if (tag?.dragType === DragTypes.dragEnd && coverChild) {
                // 同步数据
            }

            if (tag?.dragType === DragTypes.dragEnd) {
                setCoverChild(undefined)
                const triggerInfo = {
                    area: parentRef?.current,
                    moveTag: tag,
                    coverChild: coverChild
                }
                props.onMoveInChange && props.onMoveInChange(triggerInfo);
            } else {
                setCoverChild(coverChild);
            }
        }

        // 拖拽外部元素不在当前区域内的事件
        const noAddEvent: listenEventFunc = (tag, e) => {
            if (tag?.dragType === DragTypes.dragEnd) {
                setCoverChild(undefined)
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
            initChildren(initChildrenRef.current);
        }

        // 获取所有的子元素
        const listenChild = (value: ChildTypes) => {
            initChildrenRef.current.push(value);
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