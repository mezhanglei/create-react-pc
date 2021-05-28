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