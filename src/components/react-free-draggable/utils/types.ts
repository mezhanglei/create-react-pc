import { CSSProperties } from "react";

// 事件对象
export type EventType = MouseEvent | TouchEvent;

// 事件对象的位置接口
export interface EventData {
    node?: any; // 节点
    deltaX: number; // x方向移动的距离
    deltaY: number; // y方向移动的距离
    eventX: number; // 事件对象位置x
    eventY: number; // 事件对象位置y
    lastEventX: number; // 上个事件对象位置x
    lastEventY: number; // 上个事件对象位置y
}

// 拖拽元素的位置接口
export interface DragData {
    node?: any; // 节点
    deltaX: number; // x方向移动的距离
    deltaY: number; // y方向移动的距离
    x: number; // 元素位置x
    y: number; // 元素位置y
    translateX: number; // 当前x轴的translate
    translateY: number; // 当前y轴的translate
    zIndex?: number; // 层级
    lastX: number; // 上个位置x
    lastY: number; // 上个位置y
}

// 位置类型
export interface PositionType {
    x: number;
    y: number;
}

// 轴的类型
// 轴的类型
export type AxisType = "both" | "x" | "y" | "none";

// 限制范围的类型
export interface BoundsInterface {
    xStart: number;
    xEnd: number;
    yStart: number;
    yEnd: number;
}

// DraggableEvent的props的类型
export interface DraggableEventProps {
    children: any;
    onDragStart?: EventHandler; // 拖拽开始事件
    onDrag?: EventHandler; // 拖拽进行事件
    onDragStop?: EventHandler; // 拖拽结束事件
    allowAnyClick?: boolean; // 表示允许非鼠标左键单击拖动
    disabled?: boolean; // 禁止拖拽
    dragNode?: string | HTMLElement; // 拖拽句柄的类选择器
    disabledNode?: string | HTMLElement; // 不允许拖拽的选择器
    enableUserSelectHack?: boolean; // 允许添加选中样式
    grid?: [number, number]; // 设置x,y方向的拖拽幅度，多少幅度移动一次目标
    bounds?: string | HTMLElement;
}

// Draggable的props的类型
export interface DraggableProps {
    children: any;
    allowAnyClick?: boolean; // 表示允许非鼠标左键单击拖动
    disabled?: boolean; // 禁止拖拽
    dragNode?: string | HTMLElement; // 拖拽句柄的类选择器
    disabledNode?: string | HTMLElement; // 不允许拖拽的选择器
    enableUserSelectHack?: boolean; // 允许添加选中样式
    grid?: [number, number]; // 设置x,y方向的拖拽幅度，多少幅度移动一次目标
    scale?: number; // 拖拽灵敏度
    x?: number;
    y?: number;
    axis?: AxisType; // 限制拖拽的方向
    positionOffset?: PositionType; // 接收偏移位置（不受bounds和boundsParent影响）
    bounds?: string | HTMLElement | BoundsInterface; // 限制拖拽的父元素，默认body, 或者在boundsParent元素内部范围的限制拖拽范围
    zIndexRange?: [number, number]; // zIndex的变化范围
    className?: string;
    style?: CSSProperties;
    transform?: string;
    onDragStart?: DragHandler; // 拖拽开始事件
    onDrag?: DragHandler; // 拖拽进行事件
    onDragStop?: DragHandler; // 拖拽结束事件
}

// 事件处理函数的type
export type EventHandler<E = EventType, T = EventData> = (e: E, data?: T) => void | boolean;
export type DragHandler<E = EventType, T = DragData> = (e: E, data?: T) => void | boolean;

export interface MutationRecord {
    type: "attributes" | "characterData" | "childList", // 监听属性变化, characterData变化, 子节点树变化
    target?: Node, // 返回变化所影响的节点
    addedNodes?: NodeList, // 返回被添加的节点
    removedNodes?: NodeList, // 返回被移除的节点
    previousSibling?: Node, // 返回被添加或移除的节点之前的兄弟节点，没有返回null
    nextSibling?: Node, // 返回被添加或移除的节点之后的兄弟节点，或者 null
    attributeName?: string, // 返回被修改的属性的属性名，或者 null。
    attributeNamespace?: string, // 返回被修改属性的命名空间，或者 null
    oldValue?: any // 变动前的值。这个属性只对 attribute 和 characterData 变动有效，如果发生 childList 变动，则返回 null, attributeOldValue 或者 characterDataOldValue 必须设置为 true
}

export interface ObserverOptions {
    attributeFilter?: string[], // 监听的特定属性数组，默认监听所有属性
    attributeOldValue?: boolean, // 记录任何有改动的属性的上一个值
    attributes?: boolean, // 默认false, 监听元素的属性值变化
    characterData?: boolean, // 监视指定目标节点或子节点树中节点所包含的字符数据的变化
    characterDataOldValue?: boolean, // 在文本在受监视节点上发生更改时记录节点文本的先前值
    childList?: boolean, // 以监视目标节点（如果 subtree 为 true，则包含子孙节点）添加或删除新的子节点,默认值为 false。
    subtree?: boolean, // 将监视范围扩展至目标节点整个节点树中的所有节点
}

export interface ObserverType {
    observe: (node: Node, options: ObserverOptions) => void; // 订阅通知
    disconnect: () => void, // 断开通知
    takeRecords?: () => MutationRecord[] // 在断开观察者之前立即获取所有未处理的更改记录，以便在停止观察者时可以处理任何未处理的更改。
}
