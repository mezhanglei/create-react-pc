/* Forked from react-virtualized 💖 */
import { ALIGNMENT } from './constants';

export default class SizeAndPositionManager {

    constructor({ itemCount, itemSizeGetter, estimatedItemSize }) {
        // 获取尺寸的函数
        this.itemSizeGetter = itemSizeGetter;
        // 懒加载最大条数
        this.itemCount = itemCount;
        // 估算的元素尺寸
        this.estimatedItemSize = estimatedItemSize;

        // 选项大小和位置的缓存
        this.itemSizeAndPositionData = {};

        // 计算索引项大小和位置时的最后一个序号
        this.lastMeasuredIndex = -1;
    }


    // 更新尺寸
    updateConfig({ itemCount, itemSizeGetter, estimatedItemSize }) {
        if (itemCount != null) {
            this.itemCount = itemCount;
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
        if (index < 0 || index >= this.itemCount) {
            throw Error(
                `Requested index ${index} is outside of range 0..${this.itemCount}`,
            );
        }

        // 如果是未知项，则从已知的最后一项到未知项之间所有的元素的位置和大小都缓存起来
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
            (this.itemCount - this.lastMeasuredIndex - 1) * this.estimatedItemSize
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
        if (containerSize <= 0) {
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
     * offset: 滚动距离
     * overscanCount: 预览的元素个数(默认前后各三个元素)
     */
    getVisibleRange({ containerSize, offset, overscanCount }) {
        const totalSize = this.getTotalSize();

        if (totalSize === 0) {
            return {};
        }

        // 最大滚动距离
        const maxOffset = offset + containerSize;
        let start = this.findNearestItem(offset);

        if (typeof start === 'undefined') {
            throw Error(`Invalid offset ${offset} specified`);
        }

        const datum = this.getSizeAndPositionForIndex(start);
        offset = datum.offset + datum.size;

        let stop = start;

        while (offset < maxOffset && stop < this.itemCount - 1) {
            stop++;
            offset += this.getSizeAndPositionForIndex(stop).size;
        }

        if (overscanCount) {
            start = Math.max(0, start - overscanCount);
            stop = Math.min(stop + overscanCount, this.itemCount - 1);
        }

        return {
            start,
            stop
        };
    }

    // 清除指定索引后项的所有缓存值。如果元素选项改变了大小则用此方法决定是否清除缓存项
    resetItem(index) {
        this.lastMeasuredIndex = Math.min(this.lastMeasuredIndex, index - 1);
    }

    // 根据滚动距离返回可视区域上方的接近索引项, 找不到则匹配为0
    findNearestItem(offset) {
        if (isNaN(offset)) {
            throw Error(`Invalid offset ${offset} specified`);
        }

        offset = Math.max(0, offset);

        // 最后一项
        const lastMeasuredSizeAndPosition = this.getSizeAndPositionOfLastMeasuredItem();
        const lastMeasuredIndex = Math.max(0, this.lastMeasuredIndex);

        if (lastMeasuredSizeAndPosition.offset >= offset) {
            // 二分查找
            return this.binarySearch({
                high: lastMeasuredIndex,
                low: 0,
                offset,
            });
        } else {
            // 如果滚动过快导致还没测量到值则进行指数搜素
            return this.exponentialSearch({
                index: lastMeasuredIndex,
                offset,
            });
        }
    }

    // 二分搜索
    binarySearch({low,high, offset}) {
        let middle = 0;
        let currentOffset = 0;

        while (low <= high) {
            middle = low + Math.floor((high - low) / 2);
            currentOffset = this.getSizeAndPositionForIndex(middle).offset;

            if (currentOffset === offset) {
                return middle;
            } else if (currentOffset < offset) {
                low = middle + 1;
            } else if (currentOffset > offset) {
                high = middle - 1;
            }
        }

        if (low > 0) {
            return low - 1;
        }

        return 0;
    }

    // 指数搜索
    exponentialSearch({ index, offset }) {
        let interval = 1;

        while (
            index < this.itemCount &&
            this.getSizeAndPositionForIndex(index).offset < offset
        ) {
            index += interval;
            interval *= 2;
        }

        return this.binarySearch({
            high: Math.min(index, this.itemCount - 1),
            low: Math.floor(index / 2),
            offset,
        });
    }
}
