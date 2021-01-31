import buildDraggableArea from './DraggableAreaBuilder';

/**
 * 拖拽容器组件，可以实例化一组拖拽组件
 * 使用：
 *   实例化： const DraggableAreaGroup = new DraggableTagsGroup();
 *   const DraggableArea = DraggableAreaGroup.addArea(areaId)
 */
export default class DraggableTagsGroup {
    addAreaFn: any[];
    constructor() {
        this.addAreaFn = [];
    }

    addArea(areaId: string | number): any {
        return buildDraggableArea({
            // 在拖拽区域触发所有绑定事件，并返回接收区域和拖拽区域的信息
            triggerAddFunc: (dragRect: any, tag: any, e: MouseEvent | TouchEvent): any => {
                let x = dragRect.left + dragRect.width / 2;
                let y = dragRect.top + dragRect.height / 2;

                let result = {};
                this.addAreaFn.forEach(fn => {
                    const r = fn({ tag, x, y, fromAreaId: areaId, e });
                    if (r.isIn) {
                        result = r;
                    }
                });

                return result;
            },
            // 实例化时给每个区域绑定一个函数事件, 将每个区域的添加tag方法存在其中
            listenAddFunc: (area: any, addTag: any) => {
                this.addAreaFn.push(function ({ tag, x, y, fromAreaId, e }: any): any {

                    // 存在区域添加进tag
                    const rect = area.getBoundingClientRect();
                    if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {
                        addTag({ tag, fromAreaId, x, y, e });
                        return {
                            isIn: true,
                            toAreaId: areaId,
                            fromAreaId: fromAreaId
                        };
                    }

                    return {
                        isIn: false,
                    };
                });
            }
        });
    }
}
