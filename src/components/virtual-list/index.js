import * as React from 'react';
import SizeAndPositionManager from './SizeAndPositionManager';
import { isArray } from "@/utils/type";
import {
    DIRECTION,
    SCROLL_CHANGE_REASON,
    marginProp,
    oppositeMarginProp,
    positionProp,
    scrollProp,
    sizeProp,
} from './constants';

const STYLE_WRAPPER = {
    overflow: 'auto',
    willChange: 'transform', // 告知浏览器该元素会有哪些变化的方法,提前做好对应的优化准备工作, 但会消耗内存
    WebkitOverflowScrolling: 'touch', // 当手指从触摸屏上移开，会保持一段时间的滚动, 非标准尽量不要用
};

const STYLE_INNER = {
    position: 'relative',
    width: '100%',
    minHeight: '100%',
};

const STYLE_ITEM = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
};

/**
 * 虚拟列表:
 *    实现原理：在数据渲染之前根据设定的尺寸进行计算需要渲染的索引项，然后开始渲染
 *    适用场景: 一次性加载巨量数据时使用 
 *    特点: 1. 暂时只支持可视区域内的渲染,可视区域外的将会被卸载
 *          2. 支持自定义渲染数据
 *          3. 支持横向和竖向的滚动
 * estimatedItemSize: number 列表元素估算的大小(滚动方向上的)
 * width和height: number | string 列表区域的大小(滚动方向上的)
 * limit: number  懒加载的最大条数
 * itemSize: number | array | function(index) {} 列表元素的高度（宽度）
 * onScroll: function(scrollTop, e) {} 滚动触发的函数
 * onItemsRendered: function({startIndex: number, stopIndex: number}) {} 加载新的数据时触发的函数, startIndex, stopIndex为渲染的起始和终点索引
 * overscanCount: number 预加载的元素个数(默认前后各三个)
 * renderItem: function({index: number, style: Object}) {} 返回渲染的单元
 * scrollOffset: number 设置滚动到哪个位置
 * scrollToIndex: number 设置滚动到哪一条数据
 * scrollToAlignment: 'start' | 'center' | 'end' | 'auto' 与结合使用scrollToIndex, 指定索引项在可见区域的位置 start起始区域 center中间区域 end尾部区域 auto自动显示scrollToIndex位置所在区域
 * scrollDirection: 'vertical' | 'horizontal' 设置列表的滚动方向
 * style: object 组件样式
 */
export default class VirtualList extends React.PureComponent {
    static defaultProps = {
        overscanCount: 3,
        scrollDirection: DIRECTION.VERTICAL,
        estimatedItemSize: 50,
        width: '100%',
    };

    // 获取列表元素指定选项的尺寸的函数
    itemSizeGetter = (itemSize) => (index) => {
        if (typeof itemSize === 'function') {
            return itemSize(index);
        }
        return Array.isArray(itemSize) ? itemSize[index] : itemSize;
    };

    sizeAndPositionManager = new SizeAndPositionManager({
        limit: this.props.limit,
        dataSource: this.props.dataSource,
        itemSizeGetter: this.itemSizeGetter(this.props.itemSize),
        estimatedItemSize: this.props.estimatedItemSize,
    });

    state = {
        scrollSize:
            this.props.scrollOffset ||
            (this.props.scrollToIndex != null &&
                this.getScrollForIndex(this.props.scrollToIndex)) ||
            0,
        scrollChangeReason: SCROLL_CHANGE_REASON.REQUESTED,
        _self: this
    };

    styleCache = {}

    // props变化时(优点: 可以对于比较频繁的props变化只执行一次render)
    static getDerivedStateFromProps(nextProps, prevState) {
        const { prevProps, _self } = prevState;
        if (prevProps) {
            const {
                estimatedItemSize,
                limit,
                dataSource,
                itemSize,
                scrollOffset,
                scrollToAlignment,
                scrollToIndex,
            } = prevProps;

            // 列表是否变化
            const itemPropsHaveChanged =
                nextProps.limit !== limit ||
                nextProps.dataSource?.toString() != dataSource?.toString() ||
                nextProps.itemSize !== itemSize ||
                nextProps.estimatedItemSize !== estimatedItemSize;

            // 尺寸，更新sizeAndPositionManager类的尺寸
            if (nextProps.itemSize !== itemSize) {
                _self.sizeAndPositionManager.updateConfig({
                    itemSizeGetter: _self.itemSizeGetter(nextProps.itemSize),
                });
            }

            // 列表项变化引起更新sizeAndPositionManager类
            if (
                nextProps.limit !== limit ||
                nextProps.dataSource?.toString() != dataSource?.toString() ||
                nextProps.estimatedItemSize !== estimatedItemSize
            ) {
                _self.sizeAndPositionManager.updateConfig({
                    limit: nextProps.limit,
                    dataSource: nextProps.dataSource,
                    estimatedItemSize: nextProps.estimatedItemSize,
                });
            }

            // 列表变化就重置和清空缓存
            if (itemPropsHaveChanged) {
                _self.recomputeSizes();
            }

            // scrollOffset和列表prop变化时
            if (typeof nextProps.scrollOffset === 'number' &&
                (nextProps.scrollToAlignment !== scrollToAlignment || nextProps.scrollOffset !== scrollOffset || itemPropsHaveChanged)) {
                return {
                    scrollSize: nextProps.scrollOffset || 0,
                    scrollChangeReason: SCROLL_CHANGE_REASON.REQUESTED,
                    prevProps: nextProps
                };
                // scrollToIndex和列表prop变化时
            } else if (
                typeof nextProps.scrollToIndex === 'number' &&
                (nextProps.scrollToAlignment !== scrollToAlignment || nextProps.scrollToIndex !== scrollToIndex || itemPropsHaveChanged)
            ) {
                return {
                    scrollSize: _self.getScrollForIndex(
                        nextProps.scrollToIndex,
                        nextProps.scrollToAlignment,
                        nextProps.limit,
                        nextProps.dataSource
                    ),
                    scrollChangeReason: SCROLL_CHANGE_REASON.REQUESTED,
                    prevProps: nextProps
                };
            }
        }
        return {
            prevProps: nextProps
        };
    }

    componentDidMount() {
        this.rootNode.addEventListener('scroll', this.handleScroll, {
            passive: true, // 不阻止默认行为
        });

        // 初始化位置
        const { scrollSize } = this.state;
        this.scrollTo(scrollSize);
    }

    componentDidUpdate(prePros, prevState) {
        const { scrollSize, scrollChangeReason } = this.state;
        const { dataSource } = this.props;
        if (
            (prevState.scrollSize !== scrollSize ||
                prePros?.dataSource?.toString() != dataSource?.toString()) &&
            scrollChangeReason === SCROLL_CHANGE_REASON.REQUESTED
        ) {
            this.scrollTo(scrollSize);
        }
    }

    componentWillUnmount() {
        this.rootNode.removeEventListener('scroll', this.handleScroll);
    }

    // 滚动到目标距离
    scrollTo(value) {
        const { scrollDirection } = this.props;

        this.rootNode[scrollProp[scrollDirection]] = value;
    }

    // 根据index获取scroll滚动距离
    getScrollForIndex(
        index,
        scrollToAlignment = this.props.scrollToAlignment,
        limit = this.props.limit,
        dataSource = this.props.dataSource
    ) {
        const { scrollDirection } = this.props;
        limit = limit > dataSource?.length ? dataSource?.length : limit;
        if (index < 0 || index >= limit) {
            index = 0;
        }

        return this.sizeAndPositionManager.getUpdatedScrollForIndex({
            align: scrollToAlignment,
            containerSize: this.props[sizeProp[scrollDirection]],
            currentOffset: (this.state && this.state.scrollSize) || 0,
            targetIndex: index,
        });
    }

    // 重置索引项和清除缓存
    recomputeSizes(startIndex = 0) {
        this.styleCache = {};
        this.sizeAndPositionManager.resetItem(startIndex);
    }

    // 监听滚动
    handleScroll = (event) => {
        const { onScroll } = this.props;
        const scrollOffset = this.getNodeScrollOffset();

        if (
            scrollOffset < 0 ||
            this.state.scrollSize === scrollOffset ||
            event.target !== this.rootNode
        ) {
            return;
        }

        this.setState({
            scrollSize: scrollOffset,
            scrollChangeReason: SCROLL_CHANGE_REASON.OBSERVED,
        });

        if (typeof onScroll === 'function') {
            onScroll(scrollOffset, event);
        }
    };

    // 获取节点滚动距离
    getNodeScrollOffset() {
        const { scrollDirection } = this.props;

        return this.rootNode[scrollProp[scrollDirection]];
    }

    // 需要设置在目标序号上的样式
    getStyle(index) {
        const style = this.styleCache[index];

        if (style) {
            return style;
        }

        const { scrollDirection } = this.props;
        const {
            size,
            offset,
        } = this.sizeAndPositionManager.getSizeAndPositionForIndex(index);

        return (this.styleCache[index] = {
            ...STYLE_ITEM,
            [sizeProp[scrollDirection]]: size,
            [positionProp[scrollDirection]]: offset,
        });
    }

    render() {
        const {
            overscanCount,
            renderItem,
            dataSource,
            onItemsRendered,
            scrollDirection,
            style,
            width,
            height,
            className
        } = this.props;

        // 计算需要显示的列表序号范围
        const { start, stop } = this.sizeAndPositionManager.getVisibleRange({
            containerSize: this.props[sizeProp[scrollDirection]] || 0,
            scrollSize: this.state.scrollSize,
            overscanCount,
        });

        const wrapperStyle = { ...STYLE_WRAPPER, ...style, height, width };
        const innerStyle = {
            ...STYLE_INNER,
            [sizeProp[scrollDirection]]: this.sizeAndPositionManager.getTotalSize(),
        };

        // 设置display
        if (scrollDirection === DIRECTION.HORIZONTAL) {
            innerStyle.display = 'flex';
        }

        // 子元素
        const items = isArray(dataSource) && dataSource.length && dataSource.map((item, index) => {
            if (typeof start !== 'undefined' && typeof stop !== 'undefined') {
                if (index >= start && index <= stop) {
                    const itemComponent = renderItem({
                        item,
                        index
                    });
                    const itemStyle = this.getStyle(index);
                    return React.cloneElement(React.Children.only(itemComponent), {
                        style: { ...itemComponent.props.style, ...itemStyle }
                    });
                }
            }
        }) || [];

        // 当加载新数据时触发的回调函数
        if (typeof start !== 'undefined' && typeof stop !== 'undefined') {
            if (typeof onItemsRendered === 'function') {
                onItemsRendered({
                    startIndex: start,
                    stopIndex: stop,
                });
            }
        }

        return (
            <div ref={node => this.rootNode = node} className={className} style={wrapperStyle}>
                <div style={innerStyle}>{items}</div>
            </div>
        );
    }
}
