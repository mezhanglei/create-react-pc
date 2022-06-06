import React, { CSSProperties } from 'react';
import SizeAndPositionManager from './SizeAndPositionManager';
import { addEvent, removeEvent, setScroll } from "@/utils/dom";
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
import { isEqual } from '@/utils/object';

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
  width: string; // 容器的宽度
  scrollDirection: DIRECTION; // 滚动的方向
  limit?: number; // 加载最大限制个数
  dataSource: any[]; // 数据源
  itemSize: number | any[] | ((index: number) => number); // 列表项的高度
  estimatedItemSize: number; // 估算的列表项高度
  scrollOffset?: number; // 设置滚动到哪个位置
  scrollToIndex?: number; // 设置滚动到哪一条数据
  scrollToAlignment: ALIGNMENT; // 与scrollToIndex结合使用
  overscanCount: number; //  预加载的元素个数(默认前后各三个)
  onItemsRendered?: (start: number, end: number) => any; // 加载新的数据时触发的函数
  onScroll?: (e: Event, offset: number) => any; // 滚动触发函数
  children: any;
};

export interface ListState {
  prevScrollDirection?: DIRECTION;
  prevScrollToIndex?: number | undefined;
  prevScrollOffset?: number | undefined;
  prevScrollToAlignment?: ALIGNMENT;
  prevEstimatedItemSize?: number;
  prevItemSize?: number | any[] | ((index: number) => number);
  prevDataSource?: any[];
  prevLimit?: number | undefined;
  scrollSize: number;
  canSetScroll: boolean;
}

class VirtualList extends React.Component<VirtualListProps, ListState> {
  styleCache: CSSProperties;
  wrap: any;
  constructor(props: VirtualListProps) {
    super(props);
    this.styleCache = {};
    this.state = {
      scrollSize: this.props.scrollOffset ||
        (this.props.scrollToIndex != null &&
          this.getScrollForIndex(this.props.scrollToIndex)) ||
        0,
      canSetScroll: true
    };
  }

  static defaultProps = {
    overscanCount: 3,
    scrollDirection: DIRECTION.VERTICAL,
    scrollToAlignment: ALIGNMENT.START,
    estimatedItemSize: 50,
    width: '100%'
  }

  // 获取列表元素指定选项的尺寸的函数
  itemSizeGetter = (itemSize: number | any[] | ((index: number) => number)) => (index: number) => {
    if (typeof itemSize === 'function') {
      return itemSize(index);
    }
    return Array.isArray(itemSize) ? itemSize[index] : itemSize;
  };

  manager = new SizeAndPositionManager({
    limit: this.props.limit,
    dataSource: this.props.dataSource,
    itemSizeGetter: this.itemSizeGetter(this.props.itemSize),
    estimatedItemSize: this.props.estimatedItemSize,
  });

  componentDidMount() {
    // 初始化绑定事件
    const node = this.findDOMNode();
    if (node) {
      addEvent(node, "scroll", this.handleScroll, { passive: true });
    }
    // 初始化位置
    const { scrollSize } = this.state;
    this.scrollTo(scrollSize);
  }

  componentWillUnmount() {
    const node = this.findDOMNode();
    removeEvent(node, 'scroll', this.handleScroll);
  }

  componentDidUpdate(prevProps: VirtualListProps, prevState: ListState) {

    const scrollSizeChange = this.state.scrollSize !== prevState.scrollSize;
    const dataChange = !isEqual(this.props.dataSource, prevProps?.dataSource);
    const limitChange = this.props.limit !== prevProps.limit;
    const itemSizeChange = this.props.itemSize !== prevProps?.itemSize;
    const estimatedItemSizeChange = this.props.estimatedItemSize !== prevProps?.estimatedItemSize;
    const scrollToAlignmentChange = this.props.scrollToAlignment !== prevProps?.scrollToAlignment;
    const scrollOffsetChange = this.props.scrollOffset !== prevProps?.scrollOffset;
    const scrollToIndexChange = this.props.scrollToIndex !== prevProps?.scrollToIndex;
    const scrollDirectionChange = this.props.scrollDirection !== prevProps?.scrollDirection;

    // 列表props变化时
    if (dataChange || limitChange || itemSizeChange || estimatedItemSizeChange ||
      scrollToAlignmentChange || scrollOffsetChange || scrollToIndexChange || scrollDirectionChange
    ) {
      if (this.props?.dataSource?.length) {
        if (typeof this.props?.scrollToIndex === "number") {
          const scrollSize = this.getScrollForIndex(this.props?.scrollToIndex);
          this.setState({
            scrollSize: scrollSize,
            canSetScroll: true
          })
        } else if (typeof this.props?.scrollOffset === "number") {
          this.setState({
            scrollSize: this.props?.scrollOffset,
            canSetScroll: true
          })
        }
      }
    }

    // 列表配置信息更新
    if (dataChange || limitChange || estimatedItemSizeChange || itemSizeChange) {
      this.manager?.updateConfig({
        limit: this.props?.limit,
        dataSource: this.props?.dataSource,
        estimatedItemSize: this.props?.estimatedItemSize,
        itemSizeGetter: this.itemSizeGetter(this.props.itemSize)
      });

      if (this.props?.dataSource?.length) {
        this.recomputeSizes();
      }
    }

    if (scrollSizeChange || dataChange && this.state.canSetScroll) {
      this.scrollTo(this.state?.scrollSize);
    }
  }

  // props触发state更新
  static getDerivedStateFromProps(nextProps: VirtualListProps, prevState: ListState) {

    const limitChange = nextProps.limit !== prevState.prevLimit;
    const dataChange = !isEqual(nextProps.dataSource, prevState?.prevDataSource);
    const itemSizeChange = nextProps.itemSize !== prevState?.prevItemSize;
    const estimatedItemSizeChange = nextProps.estimatedItemSize !== prevState?.prevEstimatedItemSize;
    const scrollToAlignmentChange = nextProps.scrollToAlignment !== prevState?.prevScrollToAlignment;
    const scrollOffsetChange = nextProps.scrollOffset !== prevState?.prevScrollOffset;
    const scrollToIndexChange = nextProps.scrollToIndex !== prevState?.prevScrollToIndex;
    const scrollDirectionChange = nextProps.scrollDirection !== prevState?.prevScrollDirection;

    if (limitChange) {
      return {
        ...prevState,
        prevLimit: nextProps.limit
      };
    }
    if (dataChange) {
      return {
        ...prevState,
        prevDataSource: nextProps.dataSource
      };
    }
    if (itemSizeChange) {
      return {
        ...prevState,
        prevItemSize: nextProps?.itemSize
      };
    }
    if (estimatedItemSizeChange) {
      return {
        ...prevState,
        prevEstimatedItemSize: nextProps?.estimatedItemSize
      };
    }
    if (scrollToAlignmentChange) {
      return {
        ...prevState,
        prevScrollToAlignment: nextProps?.scrollToAlignment
      };
    }
    if (scrollOffsetChange) {
      return {
        ...prevState,
        prevScrollOffset: nextProps?.scrollOffset
      };
    }
    if (scrollToIndexChange) {
      return {
        ...prevState,
        prevScrollToIndex: nextProps?.scrollToIndex
      };
    }
    if (scrollDirectionChange) {
      return {
        ...prevState,
        prevScrollDirection: nextProps?.scrollDirection
      };
    }
    return null;
  }

  // 重置索引项和清除缓存
  recomputeSizes = (lastMeasure = 0) => {
    this.styleCache = {};
    this.manager?.resetItem(lastMeasure);
  };

  findDOMNode() {
    return this.wrap;
  }

  scrollTo = (value: number) => {
    const node = this.findDOMNode();
    if (!node) return;
    setScroll(node, 0, value);
  }

  // 根据index获取scroll滚动距离
  getScrollForIndex = (index: number) => {
    const {
      dataSource,
      limit,
      scrollToAlignment,
      scrollDirection
    } = this.props;
    const {
      scrollSize
    } = this.state;
    const node = this.findDOMNode();
    const max = Math.min(dataSource?.length || 0, limit || 0);
    if (index < 0 || index >= max) {
      index = 0;
    }

    return this.manager?.getUpdatedScrollForIndex({
      align: scrollToAlignment,
      containerSize: node[clientWH[scrollDirection]] || 0,
      currentOffset: scrollSize || 0,
      targetIndex: index
    });
  };

  // 监听滚动
  handleScroll = (event: Event) => {
    const node = this.findDOMNode();
    const scrollValue = this.getNodeScrollOffset();
    const {
      scrollSize
    } = this.state

    if (scrollValue < 0 || scrollSize === scrollValue || event.target !== node
    ) {
      return;
    }

    this.setState({
      scrollSize: scrollValue,
      canSetScroll: false
    });
    this.props?.onScroll && this.props?.onScroll(event, scrollValue);
  };

  getNodeScrollOffset = () => {
    const {
      scrollDirection
    } = this.props;
    const node = this.findDOMNode();
    return node[scrollProp[scrollDirection]];
  };

  render() {
    const {
      className,
      style,
      children,
      scrollDirection,
      width,
      height,
      overscanCount
    } = this.props;

    // 计算需要显示的列表序号范围
    const { start, stop } = this.manager?.getVisibleRange({
      containerSize: this.props[sizeProp[scrollDirection]] || 0,
      scrollSize: this.state.scrollSize,
      overscanCount,
    });

    const getStyle = (index: number) => {
      const cache = this.styleCache?.[index];
      if (cache) {
        return cache;
      }
      const { size, offset } = this.manager?.getSizeAndPositionForIndex(index);
      this.styleCache[index] = {
        ...STYLE_ITEM,
        [sizeProp[scrollDirection]]: size,
        [positionProp[scrollDirection]]: offset
      };
      return this.styleCache[index]
    };

    const wrapperStyle = { ...STYLE_WRAPPER, ...style, height: height, width: width };

    const innerStyle = {
      ...STYLE_INNER,
      [sizeProp[scrollDirection]]: this.manager?.getTotalSize(),
      ...(scrollDirection === DIRECTION.HORIZONTAL ? { display: "flex" } : {})
    };

    return (
      <div ref={node => this.wrap = node} className={className} style={wrapperStyle}>
        <div style={innerStyle}>
          {
            React.Children.map(children, (child, index) => {
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
  }
}

export default VirtualList;