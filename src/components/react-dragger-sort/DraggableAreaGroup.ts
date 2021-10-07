import buildDraggableArea from './DraggableAreaBuilder';
import { listenEventFunc } from "./utils/types";
import { getInsidePosition } from "@/utils/dom";

// 创建拖拽容器的类
export default class DraggableAreaGroup {
    listenEventList: listenEventFunc[];
    constructor() {
        this.listenEventList = [];
    }

    create() {
        return buildDraggableArea({
            // 触发所有区域的监听事件
            triggerFunc: (tag, e) => {
                let result = false;
                this.listenEventList.forEach(fn => {
                    const isTrigger = fn({ ...tag }, e);
                    if (isTrigger) {
                        result = isTrigger;
                    }
                });
                return result;
            },
            // 将所在的area的内的监听事件添加进队列
            listenFunc: (area, addEvent, noAddEvent) => {
                this.listenEventList.push(function (tag, e) {
                    if (tag?.area !== area) {
                        const parent = document?.documentElement;
                        const areaRect = getInsidePosition(area, parent);
                        const x = tag?.x || 0;
                        const y = tag?.y || 0;
                        if (areaRect && x > areaRect?.left && x < areaRect?.right && y > areaRect?.top && y < areaRect?.bottom) {
                            addEvent(tag, e);
                            return true;
                        } else {
                            noAddEvent(tag, e);
                            return false;
                        }
                    }
                    return false;
                });
            }
        });
    }
}
