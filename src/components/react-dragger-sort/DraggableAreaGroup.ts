import buildDraggableArea from './DraggableAreaBuilder';
import { AddTagFunc } from "./utils/types";
import { getRectInParent } from "@/utils/dom";

// 创建拖拽容器的类
export default class DraggableAreaGroup {
    addAreaFn: AddTagFunc[];
    constructor() {
        this.addAreaFn = [];
    }

    addArea() {
        return buildDraggableArea({
            // 将当前拖拽的tag传入所有容器监听的队列进行计算
            triggerAddFunc: (tag, e) => {
                let result = false;
                this.addAreaFn.forEach(fn => {
                    const isTrigger = fn({ ...tag }, e);
                    if (isTrigger) {
                        result = isTrigger;
                    }
                });
                return result;
            },
            // 将所在的area的添加tag的事件添加进队列
            listenAddFunc: (area, addTag) => {
                this.addAreaFn.push(function (tag, e) {
                    if (tag?.area !== area) {
                        const parent = document?.body || document?.documentElement;
                        const areaRect = getRectInParent(area, parent);
                        const x = tag?.x || 0;
                        const y = tag?.y || 0;
                        if (areaRect && x > areaRect?.left && x < areaRect?.right && y > areaRect?.top && y < areaRect?.bottom) {
                            addTag(tag, e);
                            return true;
                        }
                    }
                    return false;
                });
            }
        });
    }
}
