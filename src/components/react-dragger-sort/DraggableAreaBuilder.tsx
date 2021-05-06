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
const buildDraggableArea: DraggableAreaBuilder = (props) => {

    // 拖拽区域
    const DraggableArea = React.forwardRef<any, DraggableAreaProps>((props, ref) => {

        const {
            className,
            style,
            placeholder = true,
            children,
            bounds,
            ...rest
        } = props;

        const [dragType, setDragType] = useState<'drag' | 'resize' | 'none'>();

        const parentRef = useRef<any>();
        let childNodes = useRef<DraggerChildNodes[]>([])?.current;
        const [childLayOut, setChildLayOut] = useState<{ [key: string]: DraggerItemEvent }>({});

        const [placeholderData, setPlaceholderData] = useState<PlaceholderProps>();
        const placeholderDataRef = useRef<PlaceholderProps>()

        const [placeholderShow, setPlaceholderShow] = useState<Boolean>(false);
        const placeholderShowRef = useRef<boolean>(false);
        const [placeholderMoving, setPlaceholderMoving] = useState<Boolean>();
        const placeholderMovingRef = useRef<boolean>(false);

        useImperativeHandle(ref, () => (parentRef?.current));

        const placeholderDataChange = (val: PlaceholderProps) => {
            setPlaceholderData(val);
            placeholderDataRef.current = val;
        }

        const placeholderShowChange = (val: boolean) => {
            placeholderShowRef.current = val;
            setPlaceholderShow(val);
        }

        const placeholderMovingChange = (val: boolean) => {
            placeholderMovingRef.current = val;
            setPlaceholderMoving(val);
        }

        useEffect(() => {
            setChildLayOutFunc(childNodes);
        }, []);

        const findOwnerDocument = () => {
            return document;
        };

        // 限制范围的父元素
        const findBoundsParent = () => {
            const ownerDocument = findOwnerDocument();
            const node = (findElement(bounds)) || ownerDocument?.body || ownerDocument?.documentElement;
            return node;
        };

        // 设置子元素的位置以及宽高
        const setChildLayOutFunc = (childNodes: DraggerChildNodes[]): DraggerChildNodes | {} => {
            const parent = findBoundsParent();
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
            const parent = findBoundsParent();
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

        // 交换位置及childNodes
        const exchangePos = (tag: DraggerItemEvent, coverChild: DraggerChildNodes) => {
            let tagIndex = 0;
            let coverIndex = 0;
            childNodes?.map((item, index) => {
                if (item.id === tag?.id) {
                    tagIndex = index;
                }
                if (item?.id === coverChild?.id) {
                    coverIndex = index;
                }
            });
            const newArr = produce(childNodes, draft => {
                changeLocation(draft, tagIndex, coverIndex)
            })
            childNodes = newArr;
            // setChildLayOutFunc(childNodes);
        }

        const onDragStart: DraggerItemHandler = (e, tag) => {
            if (!tag) return false;
            setDragType('drag');
            placeholderShowChange(true);
            placeholderDataChange({
                x: tag?.x,
                y: tag?.y,
                width: tag?.width,
                height: tag?.height
            })
        }

        const onDrag: DraggerItemHandler = (e, tag) => {
            if (!tag) return false;
            placeholderMovingChange(true);
            const coverChild = moveTrigger(tag, childNodes);
            const ret = props?.onDragMove && props?.onDragMove(tag, coverChild, childNodes, e);
            if (ret && coverChild) {
                exchangePos(tag, coverChild);
            }
        }

        const onDragEnd: DraggerItemHandler = (e, tag) => {
            if (!tag) return false;
            setDragType('none');
            placeholderShowChange(false);
            placeholderMovingChange(false);
            const coverChild = moveTrigger(tag, childNodes);
            const ret = props?.onDragMoveEnd && props?.onDragMoveEnd(tag, coverChild, childNodes, e);
            if (ret && coverChild) {
                exchangePos(tag, coverChild);
            }
        }

        const onResizeStart: DraggerItemHandler = (e, tag) => {
            if (!tag) return false;
            setDragType('resize');
        }

        const onResizing: DraggerItemHandler = (e, tag) => {
            if (!tag) return false;
        }

        const onResizeEnd: DraggerItemHandler = (e, tag) => {
            setDragType('none');
            setChildLayOutFunc(childNodes);
        }

        const renderPlaceholder = () => {
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
                        background: 'rgba(15,15,15,0.3)',
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
                    position: 'relative',
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
                    parentRef: parentRef,
                    childNodes: childNodes,
                    childLayOut: childLayOut, // 优先级高于子组件的props
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