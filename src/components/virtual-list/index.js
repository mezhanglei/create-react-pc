import * as React from 'react';
import SizeAndPositionManager from './SizeAndPositionManager';
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

const STYLE_STICKY_ITEM = {
    ...STYLE_ITEM,
    position: 'sticky'
};

/**
 * 虚拟列表
 * 特点: 1. 暂时只支持可视区域内的渲染,可视区域外的将会被卸载
 *       2. 必须要指定加载的总条数
 *       3. 只支持静态数据
 * estimatedItemSize: number 列表元素估算的大小(滚动方向上的)
 * width和height: number | string 列表区域的大小(滚动方向上的)
 * itemCount: number  懒加载的最大条数
 * itemSize: number | array | function(index) {} 列表元素的高度（宽度）
 * onScroll: function(scrollTop, e) {} 滚动触发的函数
 * onItemsRendered: function({startIndex: number, stopIndex: number}) {} 加载新的数据时触发的函数, startIndex, stopIndex为渲染的起始和终点索引
 * overscanCount: number 预加载的元素个数(默认前后各三个)
 * renderItem: function({index: number, style: Object}) {} 返回渲染的单元
 * scrollOffset: number 设置滚动到哪个位置
 * scrollToIndex: number 设置滚动到哪一条数据
 * scrollToAlignment: 'start' | 'center' | 'end' | 'auto' 与结合使用scrollToIndex, 指定索引项在可见区域的位置 start起始区域 center中间区域 end尾部区域 auto自动显示scrollToIndex位置所在区域
 * scrollDirection: 'vertical' | 'horizontal' 设置列表的滚动方向
 * stickyIndices: Number[]	如[0,1,2] 控制目标index的数据实现吸顶粘性
 * style: object 组件样式
 */
export default class VirtualList extends React.PureComponent {
    static defaultProps = {
        overscanCount: 3,
        scrollDirection: DIRECTION.VERTICAL,
        width: '100%',
    };

    // 获取列表元素指定选项的尺寸的函数
    itemSizeGetter = (itemSize) => (index) => {
        if (typeof itemSize === 'function') {
            return itemSize(index);
        }
        return Array.isArray(itemSize) ? itemSize[index] : itemSize;
    };

    // 列表元素的估算尺寸
    getEstimatedItemSize(props = this.props) {
        return (
            props.estimatedItemSize ||
            (typeof props.itemSize === 'number' && props.itemSize) ||
            50
        );
    }

    sizeAndPositionManager = new SizeAndPositionManager({
        itemCount: this.props.itemCount,
        itemSizeGetter: this.itemSizeGetter(this.props.itemSize),
        estimatedItemSize: this.getEstimatedItemSize(),
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

    componentDidMount() {
        const { scrollOffset, scrollToIndex } = this.props;
        this.rootNode.addEventListener('scroll', this.handleScroll, {
            passive: true, // 不阻止默认行为
        });

        // 初始化滚动位置
        if (scrollOffset != null) {
            this.scrollTo(scrollOffset);
        } else if (scrollToIndex != null) {
            this.scrollTo(this.getScrollForIndex(scrollToIndex));
        }
    }

    // props变化时(优点: 可以对于比较频繁的props变化只执行一次render)
    static getDerivedStateFromProps(nextProps, prevState) {
        const { prevProps, _self } = prevState;
        if (prevProps) {
            const {
                estimatedItemSize,
                itemCount,
                itemSize,
                scrollOffset,
                scrollToAlignment,
                scrollToIndex,
            } = prevProps;

            const scrollPropsHaveChanged =
                nextProps.scrollToIndex !== scrollToIndex ||
                nextProps.scrollToAlignment !== scrollToAlignment;
            const itemPropsHaveChanged =
                nextProps.itemCount !== itemCount ||
                nextProps.itemSize !== itemSize ||
                nextProps.estimatedItemSize !== estimatedItemSize;

            if (nextProps.itemSize !== itemSize) {
                _self.sizeAndPositionManager.updateConfig({
                    itemSizeGetter: _self.itemSizeGetter(nextProps.itemSize),
                });
            }

            if (
                nextProps.itemCount !== itemCount ||
                nextProps.estimatedItemSize !== estimatedItemSize
            ) {
                _self.sizeAndPositionManager.updateConfig({
                    itemCount: nextProps.itemCount,
                    estimatedItemSize: _self.getEstimatedItemSize(nextProps),
                });
            }

            if (itemPropsHaveChanged) {
                _self.recomputeSizes();
            }

            if (nextProps.scrollOffset !== scrollOffset) {
                return {
                    scrollSize: nextProps.scrollOffset || 0,
                    scrollChangeReason: SCROLL_CHANGE_REASON.REQUESTED,
                    prevProps: nextProps
                };
            } else if (
                typeof nextProps.scrollToIndex === 'number' &&
                (scrollPropsHaveChanged || itemPropsHaveChanged)
            ) {
                return {
                    scrollSize: _self.getScrollForIndex(
                        nextProps.scrollToIndex,
                        nextProps.scrollToAlignment,
                        nextProps.itemCount,
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

    componentDidUpdate(_, prevState) {
        const { scrollSize, scrollChangeReason } = this.state;

        if (
            prevState.scrollSize !== scrollSize &&
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
        const { scrollDirection = DIRECTION.VERTICAL } = this.props;

        this.rootNode[scrollProp[scrollDirection]] = value;
    }

    // 根据index获取scroll滚动距离
    getScrollForIndex(
        index,
        scrollToAlignment = this.props.scrollToAlignment,
        itemCount = this.props.itemCount,
    ) {
        const { scrollDirection = DIRECTION.VERTICAL } = this.props;

        if (index < 0 || index >= itemCount) {
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
        const { scrollDirection = DIRECTION.VERTICAL } = this.props;

        return this.rootNode[scrollProp[scrollDirection]];
    }

    // 需要设置在目标序号上的样式
    getStyle(index, sticky) {
        const style = this.styleCache[index];

        if (style) {
            return style;
        }

        const { scrollDirection } = this.props;
        const {
            size,
            offset,
        } = this.sizeAndPositionManager.getSizeAndPositionForIndex(index);

        return (this.styleCache[index] = sticky
            ? {
                ...STYLE_STICKY_ITEM,
                [sizeProp[scrollDirection]]: size,
                [marginProp[scrollDirection]]: offset,
                [oppositeMarginProp[scrollDirection]]: -(offset + size),
                zIndex: 1,
            }
            : {
                ...STYLE_ITEM,
                [sizeProp[scrollDirection]]: size,
                [positionProp[scrollDirection]]: offset,
            });
    }

    render() {
        const {
            estimatedItemSize,
            height,
            overscanCount,
            renderItem,
            itemCount,
            itemSize,
            onItemsRendered,
            onScroll,
            scrollDirection,
            scrollOffset,
            scrollToIndex,
            scrollToAlignment,
            stickyIndices,
            style,
            width,
            ...props
        } = this.props;
        const { scrollSize } = this.state;
        const { start, stop } = this.sizeAndPositionManager.getVisibleRange({
            containerSize: this.props[sizeProp[scrollDirection]] || 0,
            scrollSize,
            overscanCount,
        });
        const items = [];
        const wrapperStyle = { ...STYLE_WRAPPER, ...style, height, width };
        const innerStyle = {
            ...STYLE_INNER,
            [sizeProp[scrollDirection]]: this.sizeAndPositionManager.getTotalSize(),
        };

        // 针对stickyIndices中指定的index的选项设置sticky
        if (stickyIndices != null && stickyIndices.length !== 0) {
            stickyIndices.forEach((index) => {
                items.push(
                    renderItem({
                        index,
                        style: this.getStyle(index, true),
                    }),
                );
            });

            if (scrollDirection === DIRECTION.HORIZONTAL) {
                innerStyle.display = 'flex';
            }
        }

        // stickyIndices没有的元素则设置sticky为false
        if (typeof start !== 'undefined' && typeof stop !== 'undefined') {
            for (let index = start; index <= stop; index++) {
                if (stickyIndices != null && stickyIndices.includes(index)) {
                    continue;
                }

                items.push(
                    renderItem({
                        index,
                        style: this.getStyle(index, false),
                    }),
                );
            }

            if (typeof onItemsRendered === 'function') {
                onItemsRendered({
                    startIndex: start,
                    stopIndex: stop,
                });
            }
        }

        return (
            <div ref={node => this.rootNode = node} {...props} style={wrapperStyle}>
                <div style={innerStyle}>{items}</div>
            </div>
        );
    }
}
