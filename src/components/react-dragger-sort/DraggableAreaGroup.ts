import buildDraggableArea from './DraggableAreaBuilder';
import { AddAreaFunc } from "./types";

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
                    if (r.isIn) {
                        result = r;
                    }
                });
                return result;
            },
            // 将所在的area的添加tag的事件添加进队列
            listenAddFunc: (area, addTag) => {
                this.addAreaFn.push(function (tag, e) {

                    // 拖拽区域添加tag，如果在区域内则添加进来
                    // addTag(tag);
                    // return {
                    //     isIn: true,
                    //     toAreaId: areaId,
                    //     fromAreaId: fromAreaId
                    // };

                    return {
                        isIn: false,
                        areaId: areaId,
                        fromAreaId: tag?.areaId
                    };
                });
            },
            areaId: areaId
        });
    }
}
