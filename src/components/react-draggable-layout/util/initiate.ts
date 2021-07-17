import { DragactLayoutItem, MapLayout } from "../dragact-type";
import { GridItemEvent } from "../gridItem";

/**
 * 把用户移动的块，标记为true
 */
export const syncLayout = (mapLayout: MapLayout, movingItem: GridItemEvent) => {
    if (!mapLayout) return;
    const key = movingItem.UniqueKey;
    mapLayout[key].GridX = movingItem.GridX;
    mapLayout[key].GridY = movingItem.GridY
    mapLayout[key].isMove = true;
    // for (const idx in layout) {
    //     if (layout[idx].key === movingItem.UniqueKey) {
    //         layout[idx].GridX = movingItem.GridX
    //         layout[idx].GridY = movingItem.GridY
    //         layout[idx].isMove = true
    //         break;
    //     }
    // }
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


