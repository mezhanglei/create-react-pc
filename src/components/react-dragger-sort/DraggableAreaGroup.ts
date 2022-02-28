import buildDraggableArea from './DraggableAreaBuilder';
import { listenEvent } from "./utils/types";
import { getInsidePosition } from "@/utils/dom";

// 创建拖拽容器的类
export default class DraggableAreaGroup {
  subscriptions: listenEvent[];
  area: HTMLElement | null;
  constructor() {
    this.subscriptions = [];
    this.area = null;
  }

  create() {
    return buildDraggableArea({
      // 触发所有的监听事件
      triggerFunc: (moveChild, e) => {
        let result = false;
        this.subscriptions.forEach(option => {
          const fn = option?.listener;
          const isTrigger = fn({ ...moveChild }, e);
          if (isTrigger) {
            result = isTrigger;
          }
        });
        return result;
      },
      // 将所在的area的内的监听事件添加进队列
      subscribe: (area, addEvent) => {
        this.area = area;
        this.subscriptions.push({
          listener: function (moveChild, e) {
            if (moveChild?.area !== area) {
              const parent = document?.documentElement;
              const areaRect = getInsidePosition(area, parent);
              const x = moveChild?.x || 0;
              const y = moveChild?.y || 0;
              if (areaRect && x > areaRect?.left && x < areaRect?.right && y > areaRect?.top && y < areaRect?.bottom) {
                addEvent(moveChild, e);
                return true;
              }
            }
            return false;
          },
          area: this.area
        });
      },
      unsubscribe: (area?: HTMLElement | null) => {
        this.subscriptions = this.subscriptions.filter((sub) => sub.area !== area)
      },
      draggerItems: []
    });
  }
}
