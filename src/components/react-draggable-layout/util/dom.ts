
import { DragactLayoutItem, MapLayout } from "../dragact-type";
import { GridItemEvent } from "../grid-item-types";
import { isNumber } from '@/utils/type'

/**
 * 把用户移动的块，标记为true
 */
 export const syncLayout = (mapLayout: MapLayout, movingItem: GridItemEvent) => {
    if (!mapLayout) return;
    const key = movingItem.UniqueKey;
    mapLayout[key].GridX = movingItem.GridX;
    mapLayout[key].GridY = movingItem.GridY
    mapLayout[key].isMove = true;
    return mapLayout;
}


/**
 * 初始化的时候调用
 * 会把isMove和key一起映射到layout中
 * 不用用户设置
 * @param {*} layout 
 * @param {*} children 
 */

export const MapLayoutTostate = (layout: DragactLayoutItem[], children: any[]) => {
    return layout.map((child, index) => {
        let newChild = { ...child, isMove: true, key: children[index].key, static: children[index].static }
        return newChild
    })
}

export const collision = (a: DragactLayoutItem, b: DragactLayoutItem) => {
    if (a.GridX === b.GridX && a.GridY === b.GridY &&
        a.w === b.w && a.h === b.h) {
        return true
    }
    if (a.GridX + a.w <= b.GridX) return false
    if (a.GridX >= b.GridX + b.w) return false
    if (a.GridY + a.h <= b.GridY) return false
    if (a.GridY >= b.GridY + b.h) return false
    return true
}


/**获取layout中，item第一个碰撞到的物体 */
export const getFirstCollison = (layout: DragactLayoutItem[], item: DragactLayoutItem) => {

    for (let i = 0, length = layout.length; i < length; i++) {
        if (collision(layout[i], item)) {
            return layout[i]
        }
    }
    return null
}

/**
 * 这个函数带有记忆功能
 */
export const layoutCheck = function () {

    let caches: any = {};

    const _layoutCheck = function (layout: DragactLayoutItem[], layoutItem: GridItemEvent, key: string, fristItemkey: string) {


        if (layoutItem.GridX === caches.GridX
            && layoutItem.GridY === caches.GridY
            && layoutItem.w === caches.w
            && layoutItem.h === caches.h) {
            return layout;
        }
        caches = { ...layoutItem };

        let i: any = [], movedItem: any = []/**收集所有移动过的物体 */
        let newlayout = layout.map((item, idx) => {
            if (item.key !== key) {
                if (item.static) {
                    return item
                }
                if (collision(item, layoutItem)) {
                    i.push(item.key)
                    /**
                     * 这里就是奇迹发生的地方，如果向上移动，那么必须注意的是
                     * 一格一格的移动，而不是一次性移动
                     */
                    let offsetY = item.GridY + 1

                    if (layoutItem.GridY > item.GridY && layoutItem.GridY < item.GridY + item.h) {
                        /**
                         * 元素向上移动时，元素的上面空间不足,则不移动这个元素
                         * 当元素移动到GridY>所要向上交换的元素时，就不会进入这里，直接交换元素
                         */
                        offsetY = item.GridY
                    }
                    const newItem = { ...item, GridY: offsetY, isMove: false }
                    movedItem.push(newItem)
                    return newItem
                }
            } else if (fristItemkey === key) {

                /**永远保持用户移动的块是 isMove === true */
                return { ...item, ...layoutItem }
            }

            return item
        })
        /** 递归调用,将layout中的所有重叠元素全部移动 */
        for (let c = 0; c < movedItem?.length; c++) {
            newlayout = _layoutCheck(newlayout, movedItem[c], i[c], fristItemkey)
        }
        return newlayout
    }
    return _layoutCheck;
}();

export function quickSort(a: number[]): any {
    return a.length <= 1
        ? a
        : quickSort(a.slice(1).filter(item => item <= a[0])).concat(
            a[0],
            quickSort(a.slice(1).filter(item => item > a[0]))
        )
}

export const sortLayout = (layout: any) => {
    return [].concat(layout).sort((a: any, b: any) => {
        if (a.GridY > b.GridY || (a.GridY === b.GridY && a.GridX > b.GridX)) {
            if (a.static) return 0 // 为了静态，排序的时候尽量把静态的放在前面
            return 1
        } else if (a.GridY === b.GridY && a.GridX === b.GridX) {
            return 0
        }
        return -1
    })
}

/**
 * 这个函数带有记忆功能
 */
export const getMaxContainerHeight = (function () {
    let lastOneYNH = 0;
    return function (
        layout: DragactLayoutItem[],
        elementHeight = 30,
        elementMarginBottom = 10,
        currentHeight?: number,
        useCache?: Boolean
    ) {
        if (useCache !== false) {
            const length = layout.length
            const currentLastOne = layout[length - 1]
            if (currentLastOne.GridY + currentLastOne.h === lastOneYNH) {
                return currentHeight
            }
            lastOneYNH = currentLastOne.GridY + currentLastOne.h
        }

        const ar = layout?.map(item => {
            return item.GridY + item.h
        })
        const h = quickSort(ar)[ar?.length - 1];
        const height = isNumber(h) ? (h * (elementHeight + elementMarginBottom) + elementMarginBottom) : 0;
        return height;
    }
})()

/**
 * 压缩单个元素，使得每一个元素都会紧挨着边界或者相邻的元素
 * @param {*} finishedLayout 压缩完的元素会放进这里来，用来对比之后的每一个元素是否需要压缩
 * @param {*} item 
 */
 export const compactItem = (finishedLayout: DragactLayoutItem[], item: DragactLayoutItem) => {
    if (item.static) return item;
    const newItem = { ...item, key: item.key + '' }
    if (finishedLayout.length === 0) {
        return { ...newItem, GridY: 0 }
    }
    /**
     * 类似一个递归调用
     */
    while (true) {
        let FirstCollison = getFirstCollison(finishedLayout, newItem)
        if (FirstCollison) {
            /**第一次发生碰撞时，就可以返回了 */
            newItem.GridY = FirstCollison.GridY + FirstCollison.h
            return newItem
        }
        newItem.GridY--

        if (newItem.GridY < 0) return { ...newItem, GridY: 0 }/**碰到边界的时候，返回 */
    }

}

/**
 * 压缩layout，使得每一个元素都会紧挨着边界或者相邻的元素
 * @param {*} layout 
 */
export const compactLayout = function () {
    let _cache: any = {
    };

    return function (layout: DragactLayoutItem[], movingItem?: GridItemEvent, mapedLayout?: MapLayout) {
        if (movingItem) {
            if (_cache.GridX === movingItem.GridX
                && _cache.GridY === movingItem.GridY &&
                _cache.w === movingItem.w &&
                _cache.h === movingItem.h &&
                _cache.UniqueKey === movingItem.UniqueKey
            ) {
                return {
                    compacted: layout,
                    mapLayout: mapedLayout
                };
            }
            _cache = movingItem;
        }
        let sorted = sortLayout(layout) //把静态的放在前面
        const needCompact = Array(layout.length)
        const compareList = []
        const mapLayout: MapLayout = {};
        
        
        for (let i = 0, length = sorted.length; i < length; i++) {
            let finished = compactItem(compareList, sorted[i])
            if (movingItem) {
                if (movingItem.UniqueKey === finished.key) {
                    movingItem.GridX = finished.GridX;
                    movingItem.GridY = finished.GridY;
                    finished.isMove = true
                } else
                    finished.isMove = false
            }
            else
                finished.isMove = false
            compareList.push(finished)
            needCompact[i] = finished
            mapLayout[finished.key + ''] = finished;
        }
        
        return {
            compacted: needCompact,
            mapLayout
        }
    }

}()

// grid位置边界
export const checkInContainer = (GridX: number, GridY: number, col: number, w: number) => {

    /**防止元素出container */
    if (GridX + w > col - 1) GridX = col - w //右边界
    if (GridX < 0) GridX = 0//左边界
    if (GridY < 0) GridY = 0//上边界
    return { GridX, GridY }
}

// grid宽高边界
export const checkWidthHeight = (GridX: number, w: number, h: number, col: number) => {
    let newW = w;
    let newH = h;
    if (GridX + w > col - 1) newW = col - GridX //右边界
    if (w < 1) newW = 1;
    if (h < 1) newH = 1;
    return {
        w: newW, h: newH
    }
}

/**
 * 这个函数会有副作用，不是纯函数，会改变item的Gridx和GridY
 * @param {*} item 
 */
export const correctItem = (item: DragactLayoutItem, col: number) => {
    const { GridX, GridY } = checkInContainer(item.GridX, item.GridY, col, item.w)
    item.GridX = GridX;
    item.GridY = GridY;
}
export const correctLayout = (layout: DragactLayoutItem[], col: number) => {
    var copy = [...layout];
    for (let i = 0; i < layout?.length - 1; i++) {
        correctItem(copy[i], col)
        correctItem(copy[i + 1], col);

        if (collision(copy[i], copy[i + 1])) {
            copy = layoutCheck(copy, <GridItemEvent>copy[i], (<GridItemEvent>copy[i]).UniqueKey + '', (<GridItemEvent>copy[i]).UniqueKey + '')
        }
    }

    return copy;
}