/* Forked from react-virtualized 💖 */
import { ALIGNMENT } from './constants';

export default class SizeAndPositionManager {

    constructor({ itemCount, itemSizeGetter, estimatedItemSize }) {
        // 获取尺寸的函数
        this.itemSizeGetter = itemSizeGetter;
        // 懒加载最大条数
        this.itemCount = itemCount;
        // 尺寸
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

    // 估算项目的总尺寸 = 
    getTotalSize() {
        const lastMeasuredSizeAndPosition = this.getSizeAndPositionOfLastMeasuredItem();

        return (
            lastMeasuredSizeAndPosition.offset +
            lastMeasuredSizeAndPosition.size +
            (this.itemCount - this.lastMeasuredIndex - 1) * this.estimatedItemSize
        );
    }

    /**
 * Determines a new offset that ensures a certain item is visible, given the alignment.
 *
 * @param align Desired alignment within container; one of "start" (default), "center", or "end"
 * @param containerSize Size (width or height) of the container viewport
 * @return Offset to use to ensure the specified item is visible
 */
    getUpdatedOffsetForIndex({
        align = ALIGNMENT.START,
        containerSize,
        currentOffset,
        targetIndex,
    }) {
        if (containerSize <= 0) {
            return 0;
        }

        const datum = this.getSizeAndPositionForIndex(targetIndex);
        const maxOffset = datum.offset;
        const minOffset = maxOffset - containerSize + datum.size;

        let idealOffset;

        switch (align) {
            case ALIGNMENT.END:
                idealOffset = minOffset;
                break;
            case ALIGNMENT.CENTER:
                idealOffset = maxOffset - (containerSize - datum.size) / 2;
                break;
            case ALIGNMENT.START:
                idealOffset = maxOffset;
                break;
            default:
                idealOffset = Math.max(minOffset, Math.min(maxOffset, currentOffset));
        }

        const totalSize = this.getTotalSize();

        return Math.max(0, Math.min(totalSize - containerSize, idealOffset));
    }

    getVisibleRange({
        containerSize,
        offset,
        overscanCount,
    }) {
        const totalSize = this.getTotalSize();

        if (totalSize === 0) {
            return {};
        }

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

    /**
 * Clear all cached values for items after the specified index.
 * This method should be called for any item that has changed its size.
 * It will not immediately perform any calculations; they'll be performed the next time getSizeAndPositionForIndex() is called.
 */
    resetItem(index) {
        this.lastMeasuredIndex = Math.min(this.lastMeasuredIndex, index - 1);
    }

    /**
 * Searches for the item (index) nearest the specified offset.
 *
 * If no exact match is found the next lowest item index will be returned.
 * This allows partially visible items (with offsets just before/above the fold) to be visible.
 */
    findNearestItem(offset) {
        if (isNaN(offset)) {
            throw Error(`Invalid offset ${offset} specified`);
        }

        // Our search algorithms find the nearest match at or below the specified offset.
        // So make sure the offset is at least 0 or no match will be found.
        offset = Math.max(0, offset);

        const lastMeasuredSizeAndPosition = this.getSizeAndPositionOfLastMeasuredItem();
        const lastMeasuredIndex = Math.max(0, this.lastMeasuredIndex);

        if (lastMeasuredSizeAndPosition.offset >= offset) {
            // If we've already measured items within this range just use a binary search as it's faster.
            return this.binarySearch({
                high: lastMeasuredIndex,
                low: 0,
                offset,
            });
        } else {
            // If we haven't yet measured this high, fallback to an exponential search with an inner binary search.
            // The exponential search avoids pre-computing sizes for the full set of items as a binary search would.
            // The overall complexity for this approach is O(log n).
            return this.exponentialSearch({
                index: lastMeasuredIndex,
                offset,
            });
        }
    }

    binarySearch({
        low,
        high,
        offset,
    }) {
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
