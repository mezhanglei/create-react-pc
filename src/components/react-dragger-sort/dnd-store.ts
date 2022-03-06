import { getInsidePosition } from "@/utils/dom";
import { DndSourceItem } from "./dnd-item";
import { getDistance, isOverLay } from "./utils/dom";
import { DndTargetItemType, listenEvent, NotifyEventHandle, SubscribeHandle } from "./utils/types"


export class DndStore<T extends Object = any> {

  private subscriptions: listenEvent[] = []

  public dndItemMap: Map<HTMLElement, DndTargetItemType> = new Map();

  public hoverTargetItem?: DndTargetItemType

  public constructor() {
  }

  // 订阅跨域事件
  subscribe: SubscribeHandle = (target, addEvent) => {
    this.subscriptions.push({
      // 只有跨域才会被触发
      listener: function (listenParams) {
        addEvent(listenParams);
        return target;
      },
      target: target
    });
  }

  unsubscribe = (area?: HTMLElement | null) => {
    this.subscriptions = this.subscriptions.filter((sub) => sub.target.area !== area);
  };

  // 设置当前被hover的元素
  setHoverItem = (item?: DndTargetItemType) => {
    this.hoverTargetItem = item;
  }

  // 添加可拖拽子元素
  setDndItemsMap = (node: HTMLElement, item: DndTargetItemType) => {
    this.dndItemMap.set(node, item);
  }

  // 触发
  notifyEvent: NotifyEventHandle = ({ source, e }) => {
    let result;
    let overOptions = [];
    for (let i = 0; i < this.subscriptions?.length; i++) {
      const option = this.subscriptions[i];
      const target = option.target;
      const targetArea = target.area;
      const sourceArea = source.area;
      const sourceItem = source.item;
      if (sourceArea !== targetArea) {
        const targetAreaRect = getInsidePosition(targetArea);
        const sourceAreaRect = getInsidePosition(sourceArea);
        if (!targetAreaRect || !sourceAreaRect) return;
        const sourceItemRect = {
          left: sourceItem?.x,
          top: sourceItem?.y,
          right: sourceItem?.x + sourceItem?.width,
          bottom: sourceItem?.y + sourceItem?.height
        };
        // 拖拽到目标范围内的选项
        if (isOverLay(sourceItemRect, targetAreaRect)) {
          overOptions.push(option);
        }
      }
    }
    // 求嵌套中的最近区域
    let nearOption = overOptions[0];
    for (let i = 0; i < overOptions.length; i++) {
      const option = overOptions[i];
      const target = option?.target;
      const nearTarget = nearOption.target;
      if (nearTarget?.area?.contains(target.area)) {
        nearOption = option;
      }
    }
    if (nearOption) {
      const fn = nearOption?.listener;
      const params = {
        e,
        source: { ...source },
        target: nearOption.target
      };
      const targetOption = fn(params);
      if (targetOption) {
        result = targetOption;
      }
    }
    return result;
  }

  // 找出相遇点中最近的元素
  findNearest = (sourceItem: DndSourceItem) => {
    let addChilds = [];
    let addDistance = [];
    for (let child of this.dndItemMap.values()) {
      const move = {
        left: sourceItem?.x,
        top: sourceItem?.y,
        right: sourceItem?.x + sourceItem?.width,
        bottom: sourceItem?.y + sourceItem?.height
      };
      const other = getInsidePosition(child?.node);
      if (other && isOverLay(move, other) && child.node !== sourceItem?.node) {
        addDistance.push(getDistance(move, other));
        addChilds.push(child);
      }
    }
    let minNum = Number.MAX_VALUE;
    let minChild;
    for (let i = 0; i < addDistance.length; i++) {
      if (addDistance[i] < minNum) {
        minNum = addDistance[i];
        minChild = addChilds[i];
      }
    }
    return minChild;
  }
}
