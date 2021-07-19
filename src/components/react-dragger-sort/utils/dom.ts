export interface PositionType {
    width: number;
    height: number;
    x: number;
    y: number;
}
// 比较中心点的位置判断是否重合
export const isOverLay = (tag: PositionType, item: PositionType) => {
    const tagCenter = {
        x: tag?.x + tag?.width / 2,
        y: tag?.y + tag?.height / 2
    }
    const itemCenter = {
        x: item?.x + item?.width / 2,
        y: item?.y + item?.height / 2
    }

    // 水平和竖直方向的阈值设置
    const verticalValue = Math.max(tag?.height, item?.height) / 2;
    const horizontalValue = Math.max(tag?.width, item?.width) / 2

    if (Math.abs(tagCenter?.x - itemCenter?.x) < horizontalValue && Math.abs(tagCenter?.y - itemCenter?.y) < verticalValue) {
        return true;
    } else return false;
}

export const insertAfter = (newElement: HTMLElement, targetElement: HTMLElement) => {
    const parentElement = targetElement.parentNode;
    if (!parentElement) return;
    if ((parentElement as HTMLElement).lastChild == targetElement) {
        (parentElement as HTMLElement).appendChild(newElement);
    } else {
        (parentElement as HTMLElement).insertBefore(newElement, targetElement.nextSibling);
    }
}