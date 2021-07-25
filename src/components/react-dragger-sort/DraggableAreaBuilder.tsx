import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import {
    DraggableAreaProps,
    DraggableAreaBuilder,
    DraggerContextInterface,
    TagInterface,
    listenEventFunc,
    DragTypes,
    ChildTypes,
} from "./utils/types";
import classNames from "classnames";
import { DraggerItemHandler } from "./dragger-item";
import { getOffsetWH, getPositionInPage, getRectInParent } from "@/utils/dom";
import { throttle } from "@/utils/common";
import { isOverLay } from "./utils/dom";

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
        const initChildrenRef = useRef<ChildTypes[]>([]); // 初始化所有的可拖拽子元素
        const cacheCoverChildRef = useRef<ChildTypes>(); // 实时存储同区域内的被覆盖的元素
        const cacheCrossCoverChildRef = useRef<ChildTypes>(); // 实时存储跨区域的被覆盖的元素
        const [coverChild, setCoverChild] = useState<ChildTypes>(); // 被拖拽覆盖的目标元素
        // 节流函数
        const throttleFn = useRef(throttle((fn: any, ...args: any[]) => fn(...args), 16.7)).current;

        useImperativeHandle(ref, () => (parentRef?.current));

        useEffect(() => {
            props?.mounted && props?.mounted(dataSource)
        }, [dataSource]);

        // 初始化监听事件
        useEffect(() => {
            // 初始化监听事件
            if (listenFunc) {
                const area = parentRef.current;
                listenFunc(area, AddEvent, noAddEvent);
            }
        }, []);

        // 同区域内拖拽返回覆盖目标
        const moveTrigger = (tag: TagInterface): ChildTypes | undefined => {
            throttleFn(() => {
                // 判断是不是区域内 
                const parent = document?.body || document?.documentElement;
                const areaRect = getRectInParent(parentRef.current, parent);
                const x = tag?.x || 0;
                const y = tag?.y || 0;
                if (areaRect && x > areaRect?.left && x < areaRect?.right && y > areaRect?.top && y < areaRect?.bottom) {
                    for (let i = 0; i < initChildrenRef?.current?.length; i++) {
                        const child = initChildrenRef?.current[i];
                        const position = getPositionInPage(child?.node);
                        const offsetWH = getOffsetWH(child?.node);
                        const item = {
                            width: offsetWH?.width || 0,
                            height: offsetWH?.height || 0,
                            x: position?.x || 0,
                            y: position?.y || 0
                        }
                        if (isOverLay(tag, item) && child.node !== tag?.node) {
                            cacheCoverChildRef.current = child;
                            break;
                        }
                    }
                } else {
                    cacheCoverChildRef.current = undefined;
                }
            });
            return cacheCoverChildRef.current;
        }

        // 跨区域拖拽返回覆盖目标
        const crossTrigger = (tag: TagInterface): ChildTypes | undefined => {
            throttleFn(() => {
                for (let i = 0; i < initChildrenRef?.current?.length; i++) {
                    const child = initChildrenRef?.current[i];
                    const position = getPositionInPage(child?.node);
                    const offsetWH = getOffsetWH(child?.node);
                    const item = {
                        width: offsetWH?.width || 0,
                        height: offsetWH?.height || 0,
                        x: position?.x || 0,
                        y: position?.y || 0
                    }
                    if (isOverLay(tag, item)) {
                        cacheCrossCoverChildRef.current = child;
                        break;
                    }
                }
            });
            return cacheCrossCoverChildRef.current;
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
            const coverChild = moveTrigger(areaTag);
            props?.onDragMoveEnd && props?.onDragMoveEnd(areaTag, coverChild, e);
            setCoverChild(undefined);
            cacheCoverChildRef.current = undefined;
            // 是否拖到区域外部
            if (triggerFunc) {
                const isTrigger = triggerFunc(areaTag, e);
                if (isTrigger) {
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
            if (tag?.dragType === DragTypes.draging) {
                setCoverChild(coverChild);
            } else if (tag?.dragType === DragTypes.dragEnd) {
                setCoverChild(undefined)
                cacheCrossCoverChildRef.current = undefined;
                const triggerInfo = {
                    area: parentRef?.current,
                    moveTag: tag,
                    coverChild: coverChild
                }
                props.onMoveInChange && props.onMoveInChange(triggerInfo);
            }
        }

        // 拖拽外部元素不在当前区域内的事件
        const noAddEvent: listenEventFunc = (tag, e) => {
            setCoverChild(undefined)
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
        }

        // 初始化所有的子元素(childList变动时会重新初始化)
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