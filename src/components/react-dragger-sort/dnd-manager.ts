import { css, getClientXY, getRect } from "@/utils/dom";
import { dotToRect, isMoveIn } from "./utils/dom";
import { EventType, SortableItem, DndSortable } from "./utils/types";

// 管理拖拽的类
export class DndManager<T extends Object = any> {

  // 可拖拽的节点集合
  dragItemMap: Map<HTMLElement, SortableItem>
  // 可拖放的节点集合
  dropItemMap: Map<HTMLElement, DndSortable>
  // 容器节点
  public constructor() {
    this.dragItemMap = new Map();
    this.dropItemMap = new Map();
  }

  // 添加可拖拽项
  setDragItemsMap = (data: SortableItem) => {
    this.dragItemMap.set(data.item, data);
  }

  // 添加可拖放项
  setDropItemsMap = (data: DndSortable) => {
    this.dropItemMap.set(data?.groupNode, data);
  }

  // 根据dom获取对应的可拖放项
  getDropItem = (node: HTMLElement) => {
    return this.dropItemMap.get(node);
  }

  // 根据dom获取对应的可拖拽项
  getDragItem = (node: HTMLElement) => {
    return this.dragItemMap.get(node);
  }

  // 事件对象over的目标
  findOver = (e: EventType, self: HTMLElement) => {
    const childs = [];
    const dragItems = this.dragItemMap.keys();
    const dropItems = this.dropItemMap.keys();
    const items = new Set([...dragItems, ...dropItems]);
    if (self && isMoveIn(e, self)) {
      return self;
    }
    for (let child of items) {
      if (isMoveIn(e, child)) {
        childs.push(child);
      }
    }
    let minChild;
    for (let i = 0; i < childs.length; i++) {
      if (!minChild || minChild?.contains(childs[i])) {
        minChild = childs[i];
      }
    }
    return minChild;
  }

  // 事件对象最近的目标
  findNearest = (e: EventType, parent: HTMLElement) => {
    const children = parent?.children;
    const eventXY = getClientXY(e);
    if (!eventXY) return;
    let near;
    for (let i = 0; i < children?.length; i++) {
      const node = children[i] as HTMLElement;
      if (css(node, 'display') !== 'none') {
        if (near) {
          const minChildRect = getRect(near)
          const nextChildRect = getRect(node)
          const currentDis = dotToRect(minChildRect, eventXY)
          const nextDis = dotToRect(nextChildRect, eventXY)
          if (nextDis < currentDis) {
            near = node;
          }
        } else {
          near = node;
        }
      }
    }
    return near;
  }
}
