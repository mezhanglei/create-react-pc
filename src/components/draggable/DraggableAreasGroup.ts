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
            // 将当前的tag在所有的队列中执行，从而使被拖拽对象进入正确的区域
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
            // 将所在的area的添加tag的事件添加进队列
            listenAddFunc: (area: any, addTag: any) => {
                this.addAreaFn.push(function ({ tag, x, y, fromAreaId, e }: any): any {

                    // 拖拽区域添加tag，如果在区域内则添加进来
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
