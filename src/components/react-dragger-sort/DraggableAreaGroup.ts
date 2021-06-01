import buildDraggableArea from './DraggableAreaBuilder';
import { AddAreaFunc } from "./utils/types";
import { getRectInParent } from "@/utils/dom";

// 创建拖拽容器的类
export default class DraggableAreaGroup {
    addAreaFn: AddAreaFunc[];
    constructor() {
        this.addAreaFn = [];
    }

    addArea(areaId: string | number) {
        return buildDraggableArea({
            // 将当前拖拽的tag传入所有容器监听的队列进行计算
            triggerAddFunc: (tag, e) => {
                let result = {};
                this.addAreaFn.forEach(fn => {
                    const r = fn({ ...tag }, e);
                    if (r.isTrigger) {
                        result = r;
                    }
                });
                return result;
            },
            // 将所在的area的添加tag的事件添加进队列
            listenAddFunc: (area, addTag) => {
                this.addAreaFn.push(function (tag, e) {
                    const areaNode = area?.node;
                    if (tag?.areaId !== area?.areaId) {
                        const parent = document?.body || document?.documentElement;
                        const areaRect = getRectInParent(areaNode, parent);
                        const x = tag?.x || 0;
                        const y = tag?.y || 0;
                        if (areaRect && x > areaRect?.left && x < areaRect?.right && y > areaRect?.top && y < areaRect?.bottom) {
                            const ret = {
                                isTrigger: true,
                                areaId: areaId,
                                fromAreaId: tag?.areaId
                            };
                            addTag(tag, ret, e);
                            return ret;
                        }
                    }
                    return {
                        isTrigger: false,
                        areaId: areaId,
                        fromAreaId: tag?.areaId
                    };
                });
            },
            areaId: areaId
        });
    }
}
