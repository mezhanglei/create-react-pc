/* Forked from react-virtualized and react-tiny-virtrual-list */
import { ALIGNMENT } from './constants';

export default class SizeAndPositionManager {

    constructor({ limit, dataSource, itemSizeGetter, estimatedItemSize }) {
        // 获取尺寸的函数
        this.itemSizeGetter = itemSizeGetter;
        // 懒加载最大条数
        this.limit = Math.min(limit, dataSource?.length || 0);
        // 估算的元素尺寸
        this.estimatedItemSize = estimatedItemSize;

        // 选项大小和位置的缓存
        this.itemSizeAndPositionData = {};

        // 已经缓存计算的最大索引项
        this.lastMeasuredIndex = -1;
    }

    // 更新尺寸
    updateConfig({ limit, itemSizeGetter, dataSource, estimatedItemSize }) {
        if (limit != null) {
            this.limit = Math.min(limit, dataSource?.length || 0);
        }

        if (estimatedItemSize != null) {
            this.estimatedItemSize = estimatedItemSize;
        }

        if (itemSizeGetter != null) {
            this.itemSizeGetter = itemSizeGetter;
        }
    }

    getLastMeasuredIndex() {
        return this.lastMeasuredIndex;
    }

    // 实时计算指定索引项的大小和位置，如果该项已经加载过，则直接从缓存里取
    getSizeAndPositionForIndex(index) {
        if (index < 0 || index >= this.limit) {
            // throw Error(
            //     `Requested index ${index} is outside of range 0..${this.limit}`,
            // );
            console.warn(`Requested index ${index} is outside of range [0, ${this.limit}]`);
            return { offset: 0, size: 0 };
        }

        // 如果未加载项，则从已知的最后一项到未加载项之间所有的元素的位置和大小都缓存起来
        if (index > this.lastMeasuredIndex) {
            const lastMeasuredSizeAndPosition = this.getSizeAndPositionOfLastMeasuredItem();
            let offset =
                lastMeasuredSizeAndPosition.offset + lastMeasuredSizeAndPosition.size;

            for (let i = this.lastMeasuredIndex + 1; i <= index; i++) {
                const size = this.itemSizeGetter(i);

                if (size == null || isNaN(size)) {
                    throw Error(`Invalid size returned for index ${i} of value ${size}`);
                }

                this.itemSizeAndPositionData[i] = {
                    offset,
                    size,
                };

                offset += size;
            }

            this.lastMeasuredIndex = index;
        }

        return this.itemSizeAndPositionData[index];
    }

    // 已知的最后一项的位置和大小
    getSizeAndPositionOfLastMeasuredItem() {
        return this.lastMeasuredIndex >= 0
            ? this.itemSizeAndPositionData[this.lastMeasuredIndex]
            : { offset: 0, size: 0 };
    }

    // 估算项目的总尺寸 = 已渲染的最后元素位置 + 最后元素尺寸 + 估算的元素尺寸
    getTotalSize() {
        const lastMeasuredSizeAndPosition = this.getSizeAndPositionOfLastMeasuredItem();
        return (
            lastMeasuredSizeAndPosition.offset +
            lastMeasuredSizeAndPosition.size +
            (this.limit - this.lastMeasuredIndex - 1) * this.estimatedItemSize
        );
    }

    /**
     * 指定渲染的索引项返回滚动的距离
     * align: 'auto' | 'start' | 'center' | 'end' 设定区域
     * containerSize: 可见区域的尺寸
     * currentOffset: 当前项的位置
     * targetIndex: 索引项
     */
    getUpdatedScrollForIndex({ align = ALIGNMENT.START, containerSize, currentOffset, targetIndex }) {
        if (containerSize <= 0 || this.limit <= 0) {
            return 0;
        }

        const sizeAndPosition = this.getSizeAndPositionForIndex(targetIndex);
        // 滚动最大值
        const maxScroll = sizeAndPosition.offset;
        // 滚动最小值
        const minScroll = maxScroll - containerSize + sizeAndPosition.size;

        let expectScroll;

        switch (align) {
            case ALIGNMENT.END:
                expectScroll = minScroll;
                break;
            case ALIGNMENT.CENTER:
                expectScroll = maxScroll - (containerSize - sizeAndPosition.size) / 2;
                break;
            case ALIGNMENT.START:
                expectScroll = maxScroll;
                break;
            default:
                // 默认滚动距离为范围内的优先当前项的位置
                expectScroll = Math.max(minScroll, Math.min(maxScroll, currentOffset));
        }

        const totalSize = this.getTotalSize();

        return Math.max(0, Math.min(totalSize - containerSize, expectScroll));
    }

    /**
     * 根据滚动距离返回渲染的起始点和终点索引
     * containerSize: 可视区域尺寸
     * scrollSize: 滚动距离
     * overscanCount: 预览的元素个数(默认前后各三个元素)
     */
    getVisibleRange({ containerSize, scrollSize, overscanCount }) {
        const totalSize = this.getTotalSize();

        if (totalSize === 0 || this.limit <= 0) {
            return {};
        }

        // 最大滚动距离
        const maxOffset = scrollSize + containerSize;
        // 起始点索引
        let start = this.findNearestItem(scrollSize);

        if (typeof start === 'undefined') {
            throw Error(`Invalid scrollSize ${scrollSize} specified`);
        }

        // 循环搜索终点索引
        let stop = start;
        scrollSize = this.getSizeAndPositionForIndex(start).size + scrollSize;
        while (scrollSize < maxOffset && stop < this.limit - 1) {
            stop++;
            scrollSize += this.getSizeAndPositionForIndex(stop).size;
        }

        if (overscanCount) {
            start = Math.max(0, start - overscanCount);
            stop = Math.min(stop + overscanCount, this.limit - 1);
        }

        return {
            start,
            stop
        };
    }

    // 重置计算索引项及对应的缓存
    resetItem(index) {
        this.lastMeasuredIndex = Math.min(this.lastMeasuredIndex, index - 1);
    }

    // 根据滚动距离返回可视区域起始点的接近索引项, 找不到则匹配为0
    findNearestItem(scrollSize) {
        if (isNaN(scrollSize)) {
            throw Error(`Invalid scrollSize ${scrollSize} specified`);
        }

        scrollSize = Math.max(0, scrollSize);

        const lastMeasuredSizeAndPosition = this.getSizeAndPositionOfLastMeasuredItem();
        const lastMeasuredIndex = Math.max(0, this.lastMeasuredIndex);

        if (lastMeasuredSizeAndPosition.offset >= scrollSize) {
            // 二分查找
            return this.binarySearch({
                high: lastMeasuredIndex,
                low: 0,
                scrollSize,
            });
        } else {
            // 如果滚动过快导致还没测量到值则进行指数搜素
            return this.exponentialSearch({
                index: lastMeasuredIndex,
                scrollSize,
            });
        }
    }

    // 二分搜索
    binarySearch({ low, high, scrollSize }) {
        let middle = 0;
        let currentOffset = 0;

        while (low <= high) {
            middle = low + Math.floor((high - low) / 2);
            currentOffset = this.getSizeAndPositionForIndex(middle).offset;

            if (currentOffset === scrollSize) {
                return middle;
            } else if (currentOffset < scrollSize) {
                low = middle + 1;
            } else if (currentOffset > scrollSize) {
                high = middle - 1;
            }
        }

        if (low > 0) {
            return low - 1;
        }

        return 0;
    }

    // 指数搜索和二分搜索
    exponentialSearch({ index, scrollSize }) {
        let interval = 1;

        while (
            index < this.limit &&
            this.getSizeAndPositionForIndex(index).offset < scrollSize
        ) {
            index += interval;
            interval *= 2;
        }

        return this.binarySearch({
            high: Math.min(index, this.limit - 1),
            low: Math.floor(index / 2),
            scrollSize,
        });
    }
}
