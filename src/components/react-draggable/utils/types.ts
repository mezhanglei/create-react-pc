
export type EventType = MouseEvent & TouchEvent;

// 拖拽元素的位置类型
export interface PositionInterface {
    node: any; // 节点
    deltaX: number; // x方向移动的距离
    deltaY: number; // y方向移动的距离
    lastX: number; // 上个位置x
    lastY: number; // 上个位置y
    x: number; // 当前位置x
    y: number; // 当前位置y
}

export interface DraggableEventProps {
    children: any;
    onStart?: (e: EventType, position: PositionInterface) => boolean; // 拖拽开始事件
    onDrag?: (e: EventType, position: PositionInterface) => boolean; // 拖拽进行事件
    onStop?: (e: EventType, position: PositionInterface) => boolean; // 拖拽结束事件
    allowAnyClick?: boolean; // 表示允许非鼠标左键单击拖动
    disabled?: boolean; // 禁止拖拽
    handle: string | HTMLElement; // 拖拽元素的类选择器
    cancel?: string | HTMLElement; // 不允许拖拽的选择器
    enableUserSelectHack: boolean; // 允许添加选中样式
    grid: [number, number]; // 设置幅度，多少幅度移动一次目标
    boundsParent?: string | HTMLElement; // 定位父元素，用来设置
}

export type EventHandler<T> = (e: T) => void | false;
