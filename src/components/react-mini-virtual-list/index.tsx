import React, { useEffect, useState, useRef, CSSProperties } from 'react';
import SizeAndPositionManager from './SizeAndPositionManager';
import { addEvent, removeEvent } from "@/utils/dom";
import {
    positionProp,
    scrollProp,
    sizeProp,
    clientWH,
    STYLE_WRAPPER,
    STYLE_INNER,
    STYLE_ITEM
} from './constants';
import { ALIGNMENT, DIRECTION } from "./types";

/**
 * 虚拟列表:
 *    实现原理：在数据渲染之前根据设定的尺寸进行计算需要渲染的索引项，然后开始渲染
 *    适用场景: 一次性加载巨量数据时使用 
 *    特点: 1. 暂时只支持可视区域内的渲染,可视区域外的将会被卸载
 *          2. 支持自定义渲染数据
 *          3. 支持横向和竖向的滚动
 */

export interface VirtualListProps {
    className?: string; // 外部容器的类名
    style?: object; // 外部容器的样式
    height?: number; // 容器的高度
    width?: string; // 容器的宽度
    scrollDirection?: DIRECTION; // 滚动的方向
    limit?: number; // 加载最大限制个数
    dataSource: any[]; // 数据源
    itemSize: number | any[] | ((index: number) => number); // 列表项的高度
    estimatedItemSize?: number; // 估算的列表项高度
    scrollOffset?: number; // 设置滚动到哪个位置
    scrollToIndex?: number; // 设置滚动到哪一条数据
    scrollToAlignment?: ALIGNMENT; // 与scrollToIndex结合使用
    overscanCount?: number; //  预加载的元素个数(默认前后各三个)
    onItemsRendered?: (start: number, end: number) => any; // 加载新的数据时触发的函数
    onScroll?: (e: Event, offset: number) => any; // 滚动触发函数
    children: any;
};

const VirtualList: React.FC<VirtualListProps> = (props) => {

    const {
        className,
        style,
        height,
        width = "100%",
        scrollDirection = DIRECTION.VERTICAL,
        limit,
        itemSize,
        estimatedItemSize = 50,
        scrollOffset,
        scrollToIndex,
        scrollToAlignment,
        overscanCount = 3,
        onItemsRendered,
        onScroll,
        dataSource
    } = props;

    const nodeRef = useRef<any>();

    const ManagerRef = useRef<any>();
    const styleCacheRef = useRef<CSSProperties>({});

    const [scrollSize, setScrollSize] = useState<number>(0);
    const scrollSizeRef = useRef<number>(0);

    const [start, setStart] = useState<number>();
    const [stop, setStop] = useState<number>();

    const canSetScroll = useRef<boolean>(true);

    useEffect(() => {
        // 初始化manager
        if (limit && dataSource?.length && itemSize && estimatedItemSize) {
            const manager = new SizeAndPositionManager({
                limit: limit,
                dataSource: dataSource,
                itemSizeGetter: itemSizeGetter(itemSize),
                estimatedItemSize: estimatedItemSize,
            });
            ManagerRef.current = manager;
        }

        // 初始化scrollSize
        const scrollSize = scrollOffset || (scrollToIndex != null && getScrollForIndex(scrollToIndex)) || 0;
        scrollSizeChange(scrollSize);

        // 初始化绑定事件
        const node = nodeRef.current;
        if (node) {
            addEvent(node, "scroll", handleScroll, { passive: true });
        }
        return () => {
            removeEvent(node, "scroll", handleScroll);
        };
    }, [dataSource?.length]);

    // 更新scrollSize
    useEffect(() => {
        if (dataSource?.length) {
            if (typeof scrollToIndex === "number") {
                const scrollSize = getScrollForIndex(scrollToIndex);
                canSetScroll.current = true;
                scrollSizeChange(scrollSize);
            } else if (typeof scrollOffset === "number") {
                canSetScroll.current = true;
                scrollSizeChange(scrollOffset);
            }
        }
    }, [ManagerRef.current, scrollToIndex, scrollOffset, scrollToAlignment, limit, dataSource?.length, itemSize, estimatedItemSize, scrollDirection])

    // 更新列表选项信息
    useEffect(() => {
        if (dataSource?.length) {
            ManagerRef.current?.updateConfig({
                limit: limit,
                dataSource: dataSource,
                estimatedItemSize: estimatedItemSize,
            });
        }
    }, [ManagerRef.current, limit, dataSource?.length, estimatedItemSize])

    // 更新itemSize
    useEffect(() => {
        if (dataSource?.length) {
            ManagerRef.current?.updateConfig({
                itemSizeGetter: itemSizeGetter(itemSize)
            });
        }
    }, [ManagerRef.current, dataSource?.length, itemSize])

    // 列表相关选项变化时重置
    useEffect(() => {
        if (dataSource?.length) {
            recomputeSizes();
        }
    }, [ManagerRef.current, limit, dataSource?.length, itemSize, estimatedItemSize]);

    // 滚动加载中索引变化时
    useEffect(() => {
        if (dataSource?.length) {
            const range = ManagerRef.current?.getVisibleRange({
                containerSize: nodeRef.current[clientWH[scrollDirection]] || 0,
                scrollSize: scrollSizeRef.current,
                overscanCount: overscanCount,
            });

            // 当加载新数据时触发的回调函数
            if (typeof range?.start !== 'undefined' && typeof range?.stop !== 'undefined') {
                if (typeof onItemsRendered === 'function') {
                    onItemsRendered(range?.start, range?.stop);
                }
            }

            setStart(range?.start);
            setStop(range?.stop);
        }
    }, [nodeRef.current, ManagerRef.current, scrollSizeRef.current, overscanCount, scrollDirection, dataSource?.length, onItemsRendered]);


    // 是否主动进行滚动
    useEffect(() => {
        if (typeof scrollSizeRef.current === "number" && canSetScroll.current && dataSource?.length) {
            scrollTo(scrollSizeRef.current);
        }
    }, [ManagerRef.current, dataSource?.length, scrollSizeRef.current, canSetScroll.current])

    // 监听滚动
    const handleScroll = (event: Event) => {
        const scrollValue = getNodeScrollOffset();

        if (
            scrollValue < 0 ||
            scrollSizeRef.current === scrollValue ||
            event.target !== nodeRef.current
        ) {
            return;
        }

        scrollSizeChange(scrollValue);
        canSetScroll.current = false;
        onScroll && onScroll(event, scrollValue);
    };

    // scrollSize的change
    const scrollSizeChange = (value: number) => {
        scrollSizeRef.current = value;
        setScrollSize(value);
    };

    // 滚动到目标距离
    const scrollTo = (value: number): void => {
        nodeRef.current[scrollProp[scrollDirection]] = value;
    };

    // 重置索引项和清除缓存
    const recomputeSizes = (lastMeasure = 0) => {
        styleCacheRef.current = {};
        ManagerRef.current?.resetItem(lastMeasure);
    };

    // 获取列表元素指定选项的尺寸的函数
    const itemSizeGetter = (itemSize: number | any[] | ((index: number) => number)) => (index: number) => {
        if (typeof itemSize === 'function') {
            return itemSize(index);
        }
        return Array.isArray(itemSize) ? itemSize[index] : itemSize;
    };

    // 获取节点滚动距离
    const getNodeScrollOffset = () => {
        return nodeRef.current[scrollProp[scrollDirection]];
    };

    // 根据index获取scroll滚动距离
    const getScrollForIndex = (index: number) => {
        const max = Math.min(dataSource?.length || 0, limit || 0);
        if (index < 0 || index >= max) {
            index = 0;
        }

        return ManagerRef.current?.getUpdatedScrollForIndex({
            align: scrollToAlignment,
            containerSize: nodeRef.current[clientWH[scrollDirection]] || 0,
            currentOffset: scrollSize || 0,
            targetIndex: index
        });
    };

    const getStyle = (index: number) => {
        const style = styleCacheRef.current ? styleCacheRef.current[index] : null;

        if (style) {
            return style;
        }

        const { size, offset } = ManagerRef.current?.getSizeAndPositionForIndex(index);

        return (styleCacheRef.current[index] = {
            ...STYLE_ITEM,
            [sizeProp[scrollDirection]]: size,
            [positionProp[scrollDirection]]: offset
        });
    };

    const wrapperStyle = { ...STYLE_WRAPPER, ...style, height: height, width: width };

    const innerStyle = {
        ...STYLE_INNER,
        [sizeProp[scrollDirection]]: ManagerRef.current?.getTotalSize(),
        ...(scrollDirection === DIRECTION.HORIZONTAL ? { display: "flex" } : {})
    };

    return (
        <div ref={nodeRef} className={className} style={wrapperStyle}>
            <div style={innerStyle}>
                {
                    React.Children.map(props.children, (child, index) => {
                        if (typeof start !== 'undefined' && typeof stop !== 'undefined') {
                            if (index >= start && index <= stop) {
                                const itemStyle = getStyle(index);
                                return React.cloneElement(React.Children.only(child), {
                                    style: { ...child.props.style, ...itemStyle }
                                });
                            }
                        }
                    })
                }
            </div>
        </div>
    );
};

export default VirtualList;