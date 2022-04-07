import { getEventPosition, getInsidePosition } from "@/utils/dom";
import { getMinDistance, isMoveIn } from "./utils/dom";
import { ActiveTypes, DndParams, DragTypes, listenEvent, NotifyEventHandle, SourceParams, SubscribeHandle, TargetParams } from "./utils/types";

// 管理拖拽的类
export class DndManager<T extends Object = any> {

  subscriptions: listenEvent[]
  // 所有可拖拽的节点map
  dndItemMap: Map<string, TargetParams>
  public constructor() {
    this.subscriptions = [];
    this.dndItemMap = new Map();
  }

  // 判断目标是否可以拖放新元素
  isCanDrop = (target: TargetParams) => {
    return target?.onAdd
  }

  // 获取目标路径的父元素路径
  getParentPath = (pathStr: string) => {
    const pathArr = pathStr?.split('.');
    pathArr?.pop();
    return pathArr?.join('.');
  }

  // 选中触发
  setActive = (target: TargetParams, dndParams: DndParams) => {
    const { node, onChoose } = target;
    // 触发函数
    if (node.dataset.active !== ActiveTypes.active) {
      node.dataset.active = ActiveTypes.active;
      console.log('choose:', target?.path)
      onChoose && onChoose(dndParams);
    }
  }

  // 移除触发
  removeActive = (target: TargetParams, dndParams: DndParams) => {
    const { node, onUnchoose } = target;
    if (node.dataset.active === ActiveTypes.active) {
      console.log('unchoose:', target?.path)
      onUnchoose && onUnchoose(dndParams);
      node.dataset.active = ActiveTypes.notActive;
    }
  }

  // 订阅碰撞事件
  subscribe: SubscribeHandle = (sortableItem) => {
    const dndItemMap = this.dndItemMap;
    this.subscriptions.push({
      listener: (dndParams) => {
        const { target, source } = dndParams;
        // 碰撞进行中
        if (target && sortableItem.node === target?.node) {
          const sourceParentPath = this.getParentPath(source.path);
          const targetParentPath = this.getParentPath(target.path);
          // 设置选中状态
          this.setActive(target, dndParams);
          // 移除选中状态
          if (source?.dragType === DragTypes.dragEnd) {
            this.removeActive(target, dndParams);
          }
          // 排除拖拽元素的自身的父元素和拖拽元素本身
          if (target?.path === sourceParentPath || source.node === target.node) return;
          // 同域碰撞
          if (sourceParentPath == targetParentPath && !this.isCanDrop(target)) {
            if (source?.dragType === DragTypes.draging) {

            } else {
              target?.onUpdate && target?.onUpdate(dndParams);
            }
            // 跨域碰撞
          } else {
            // 跨域目标确认
            const closest = this.isCanDrop(target) ? target : dndItemMap.get(targetParentPath);
            if (source?.dragType === DragTypes.draging) {

            } else {
              closest?.onAdd && closest?.onAdd(dndParams);
            }
          }
        } else {
          // 移出选中状态
          this.removeActive(sortableItem, dndParams);
        }
        return sortableItem;
      },
      sortableItem: sortableItem
    });
  }

  unsubscribe = (node?: HTMLElement | null) => {
    this.subscriptions = this.subscriptions.filter((sub) => sub.sortableItem.node !== node);
  };

  // 触发所有订阅元素上的绑定事件
  notifyEvent: NotifyEventHandle = (dndParams) => {
    const subscriptions = this.subscriptions;
    let result;
    for (let i = 0; i < subscriptions?.length; i++) {
      const option = subscriptions[i];
      const fn = option?.listener;
      const targetOption = fn(dndParams);
      if (targetOption) {
        result = targetOption;
      }
    }
    return result;
  }

  // 距离事件对象最近的目标
  findNearest = (params: SourceParams) => {
    let addChilds = [];
    let addDistance = [];
    const { e } = params;
    const eventXY = getEventPosition(e);
    const dndItemMap = this.dndItemMap;
    for (let child of dndItemMap.values()) {
      const childNode = child?.node;
      const other = getInsidePosition(childNode);
      // 碰撞目标(排除拖拽源的后代子元素)
      if (other && eventXY && isMoveIn(eventXY, other)) {
        addDistance.push(getMinDistance(eventXY, other));
        addChilds.push(child);
      }
    }
    let minNum = Number.MAX_VALUE;
    let minChild;
    for (let i = 0; i < addDistance.length; i++) {
      if (addDistance[i] < minNum) {
        minNum = addDistance[i];
        minChild = addChilds[i];
      } else if (addDistance[i] == minNum && minChild?.node?.contains(addChilds[i]?.node)) {
        minNum = addDistance[i];
        minChild = addChilds[i];
      }
    }
    return minChild;
  }

  // 添加可拖拽子元素
  setDndItemsMap = (item: TargetParams) => {
    this.dndItemMap.set(item.path, item);
  }
}
