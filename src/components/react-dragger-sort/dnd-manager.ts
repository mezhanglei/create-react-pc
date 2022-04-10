import { ActiveTypes, SortableItem, DndSortable } from "./utils/types";

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

  // 选中触发
  setActive = (target: HTMLElement) => {
    const node = target;
    // 触发函数
    if (node.dataset.active !== ActiveTypes.Active) {
      node.dataset.active = ActiveTypes.Active;
    }
  }

  // 移除触发
  removeActive = (target: HTMLElement) => {
    const node = target;
    if (node.dataset.active === ActiveTypes.Active) {
      node.dataset.active = ActiveTypes.NotActive;
    }
  }
}
