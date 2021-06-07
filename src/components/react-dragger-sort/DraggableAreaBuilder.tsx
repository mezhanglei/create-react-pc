import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import {
    DraggableAreaProps,
    DraggableAreaBuilder,
    DraggerContextInterface,
    DraggerChildNodes,
    TagInterface,
    AddTagFunc,
    ChildLayOut,
    InitPosition
} from "./utils/types";
import classNames from "classnames";
import { DraggerItemHandler, DraggerItemEvent } from "./dragger-item";
import { getOffsetWH, getPositionInParent } from "@/utils/dom";
import { combinedArr } from "@/utils/array";

export const DraggerContext = React.createContext<DraggerContextInterface | null>(null);

// 拖拽容器
const buildDraggableArea: DraggableAreaBuilder = (areaProps) => {

    const listenAddFunc = areaProps?.listenAddFunc;
    const triggerAddFunc = areaProps?.triggerAddFunc;
    const areaId = areaProps?.areaId;
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
        const childNodesRef = useRef<DraggerChildNodes[]>([]);
        const initPositionListRef = useRef<InitPosition[]>([]);
        const [childLayOut, setChildLayOut] = useState<ChildLayOut>({});
        const [coverChild, setCoverChild] = useState<DraggerChildNodes>();

        useImperativeHandle(ref, () => (parentRef?.current));

        useEffect(() => {
            initChildren(childNodesRef.current);
            // 初始化监听事件
            if (listenAddFunc) {
                const area = {
                    node: parentRef.current,
                    areaId: areaProps?.areaId
                }
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
        const initChildren = (childNodes: DraggerChildNodes[]) => {
            const parent = findParent();
            const layout: any = {};
            const positionList: InitPosition[] = [];
            childNodes?.map((item) => {
                if (item?.node) {
                    const position = getPositionInParent(item?.node, parent);
                    const offsetWH = getOffsetWH(item?.node);
                    layout[item?.id] = {
                        id: item?.id,
                        node: item?.node,
                        width: offsetWH?.width,
                        height: offsetWH?.height,
                        x: position?.x,
                        y: position?.y
                    }
                    const initPosition = {
                        x: position?.x || 0,
                        y: position?.y || 0
                    }
                    positionList?.push(initPosition);
                }
            })
            setChildLayOut(layout);
            initPositionListRef.current = positionList;
        }

        // 设置子元素的位置排列
        const setChildLayOutFunc = (childNodes: DraggerChildNodes[]) => {
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
        }

        // 根据当前拖拽元素和其他所有的子元素比较，如果存在接近的元素，则返回
        const moveTrigger = (tag: TagInterface): DraggerChildNodes | undefined => {
            const parent = findParent();
            const tagCenter = {
                x: (tag?.x || 0) + (tag?.width || 0) / 2,
                y: (tag?.y || 0) + (tag?.height || 0) / 2
            }
            const child = childNodesRef?.current?.find((item) => {
                const position = getPositionInParent(item?.node, parent);
                const offsetWH = getOffsetWH(item?.node);
                if (offsetWH && position && (item?.id !== tag?.id || tag?.areaId !== areaId)) {
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
            console.log(initPositionListRef.current, 222)
        }

        const onDrag: DraggerItemHandler = (e, tag) => {
            if (!tag) return false;
            const areaTag = { ...tag, areaId }
            setDragType('draging');
            const coverChild = moveTrigger(areaTag);
            setCoverChild(coverChild)
            props?.onDragMove && props?.onDragMove(areaTag, coverChild, e);
        }

        const onDragEnd: DraggerItemHandler = (e, tag) => {
            if (!tag) return false;
            const areaTag = { ...tag, areaId }
            setDragType('dragEnd');
            setCoverChild(undefined);
            const coverChild = moveTrigger(areaTag);
            props?.onDragMoveEnd && props?.onDragMoveEnd(areaTag, coverChild, e);
            // 是否拖到区域外部
            if (triggerAddFunc) {
                const ret = triggerAddFunc(areaTag, e);
                if (ret?.isTrigger) {
                    const triggerInfo = {
                        type: 'out',
                        areaId: ret?.areaId,
                        fromAreaId: ret?.fromAreaId,
                        moveTag: areaTag
                    }
                    props?.onChange && props?.onChange(triggerInfo);
                }
            }
        }

        // 监听添加外部区域来的tag
        const addTag: AddTagFunc = (tag, ret, e) => {
            const coverChild = moveTrigger(tag);
            const triggerInfo = {
                type: 'in',
                areaId: ret?.areaId,
                fromAreaId: ret?.fromAreaId,
                moveTag: tag,
                coverChild: coverChild
            }
            props.onChange && props.onChange(triggerInfo);
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
            initChildren(childNodesRef.current);
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
            </div>
        );
    });

    return DraggableArea;
}
export default buildDraggableArea