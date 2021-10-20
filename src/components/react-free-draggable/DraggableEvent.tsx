import React, { useEffect, useImperativeHandle, useRef } from 'react';
import { matchParent, addEvent, removeEvent, getEventPosition, findElement } from "@/utils/dom";
import { addUserSelectStyles, removeUserSelectStyles, snapToGrid } from "./utils/dom";
import { isMobile, isEventTouch } from "@/utils/verify";
import { DraggableEventProps, EventData, EventType } from "./utils/types";
import ReactDOM from 'react-dom';

// Simple abstraction for dragging events names.
const eventsFor = {
    touch: {
        start: 'touchstart',
        move: 'touchmove',
        stop: 'touchend',
        cancel: 'touchcancel'
    },
    mouse: {
        start: 'mousedown',
        move: 'mousemove',
        stop: 'mouseup',
        cancel: 'dragover'
    }
};

// 根据当前设备看是否触发
let dragEventFor = isMobile() ? eventsFor.touch : eventsFor.mouse;

class DraggableEvent extends React.Component<DraggableEventProps, {}> {
    dragging: boolean;
    eventData?: EventData;
    child?: any;
    constructor(props: DraggableEventProps) {
        super(props);
        this.dragging = false;
        this.eventData = undefined;
        this.state = {
        };
    }

    componentDidMount() {
        const handle = this.findHandle();
        addEvent(handle, dragEventFor.start, this.handleDragStart);
    }

    componentWillUnmount() {
        const handle = this.findHandle();
        const ownerDocument = this.findOwnerDocument();
        removeEvent(handle, dragEventFor.start, this.handleDragStart);
        removeEvent(ownerDocument, dragEventFor.move, this.handleDrag);
        removeEvent(ownerDocument, dragEventFor.stop, this.handleDragStop);
        removeEvent(ownerDocument, dragEventFor.cancel, this.handleDragStop);
        // 移除选中样式
        if (this.props?.enableUserSelectHack) removeUserSelectStyles(ownerDocument);
    }

    // 顶层document对象
    findOwnerDocument = () => {
        const node = this.findDOMNode();
        return node?.ownerDocument;
    };

    findDOMNode() {
        return ReactDOM.findDOMNode(this);
    }

    // 拖拽句柄
    findHandle = () => {
        const child = this.findDOMNode();
        const childStyle = child?.ownerDocument?.defaultView?.getComputedStyle(child);
        const handle = this.props.handle && findElement(this.props.handle) || child;
        if (childStyle?.display === "inline") {
            throw new Error("the style of `props.children` cannot is `inline`, because `transform` has no effect on Element ");
        }
        return handle;
    };

    // 禁止拖拽的节点
    findDisabledNode = () => {
        const node = this.props.disabledNode && findElement(this.props.disabledNode);
        return node;
    };

    // 获取定位父元素, 涉及的位置相对于该父元素
    getLocationParent = () => {
        const parent = findElement(this.props?.locationParent) || document.body || document.documentElement;
        return parent;
    }

    handleDragStart = (e: EventType) => {
        const handle = this.findHandle();
        const child = this.findDOMNode();
        const disabledNode = this.findDisabledNode();
        const ownerDocument = this.findOwnerDocument();
        e.preventDefault();

        if (!ownerDocument) {
            throw new Error('<DraggableEvent> not mounted on DragStart!');
        }

        // pc端鼠标操作时允许非左键操作
        if (!this.props?.allowAnyClick && !isEventTouch(e) && typeof e.button === 'number' && e.button !== 0) return;
        // 移动设备阻止默认行为
        if (e.type === 'touchstart') e.preventDefault();

        // props控制是否拖拽
        if (this.props?.disabled ||
            (!(e.target instanceof ownerDocument?.defaultView?.Node)) ||
            (handle && !matchParent(e.target, handle)) ||
            (disabledNode && matchParent(e.target, disabledNode))) {
            return;
        }

        // locationParent内的位置
        const parent = this.getLocationParent();
        const positionXY = getEventPosition(e, parent);
        if (!positionXY) return;
        const positionX = positionXY?.x;
        const positionY = positionXY?.y;

        // 返回事件对象相关的位置信息
        this.eventData = {
            node: child,
            deltaX: 0,
            deltaY: 0,
            lastEventX: positionX,
            lastEventY: positionY,
            eventX: positionX,
            eventY: positionY
        };

        // 如果没有完成渲染或者返回false则禁止拖拽
        const shouldUpdate = this.props?.onDragStart && this.props?.onDragStart(e, this.eventData);
        if (shouldUpdate === false) return;

        // 滚动过程中选中文本被添加样式
        if (this.props?.enableUserSelectHack) addUserSelectStyles(ownerDocument);

        this.dragging = true;
        this.eventData = {
            ...this.eventData,
            lastEventX: positionX,
            lastEventY: positionY
        }

        addEvent(ownerDocument, dragEventFor.move, this.handleDrag);
        addEvent(ownerDocument, dragEventFor.stop, this.handleDragStop);
        addEvent(ownerDocument, dragEventFor.cancel, this.handleDragStop);
    };

    handleDrag = (e: EventType) => {
        if (!this.dragging) return;
        e.preventDefault();
        // locationParent内的位置
        const parent = this.getLocationParent();
        const child = this.findDOMNode();
        const positionXY = getEventPosition(e, parent);
        if (!positionXY) return;
        let positionX = positionXY?.x;
        let positionY = positionXY?.y;

        if (!this.eventData) return;

        // 拖拽跳跃,可设置多少幅度跳跃一次
        const grid = this.props?.grid;
        if (Array.isArray(grid)) {
            const { lastEventX, lastEventY } = this.eventData;
            let deltaX = positionX - lastEventX, deltaY = positionY - lastEventY;
            [deltaX, deltaY] = snapToGrid(grid, deltaX, deltaY);
            if (!deltaX && !deltaY) return; // skip useless drag
            positionX = lastEventX + deltaX, positionY = lastEventY + deltaY;
        }

        // 返回事件对象相关的位置信息
        this.eventData = {
            node: child,
            deltaX: positionX - this.eventData?.lastEventX,
            deltaY: positionY - this.eventData?.lastEventY,
            lastEventX: positionX,
            lastEventY: positionY,
            eventX: positionX,
            eventY: positionY
        }

        // 返回false则禁止拖拽并初始化鼠标事件
        const shouldUpdate = this.props?.onDrag && this.props?.onDrag(e, this.eventData);
        if (shouldUpdate === false) {
            try {
                this.handleDragStop(new MouseEvent(e?.type));
            } catch (err) {
                // 兼容废弃版本
                const event = document.createEvent('MouseEvents');
                event.initMouseEvent('mouseup', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                this.handleDragStop(event);
            }
            return;
        }
    };

    handleDragStop = (e: EventType) => {
        if (!this.dragging || !this.eventData) return;
        e.preventDefault();
        const ownerDocument = this.findOwnerDocument();

        this.eventData = {
            ...this.eventData,
            deltaX: 0,
            deltaY: 0
        }

        const shouldContinue = this.props?.onDragStop && this.props?.onDragStop(e, this.eventData);
        if (shouldContinue === false) return;

        // 移除文本因滚动造成的显示
        if (ownerDocument) {
            // Remove user-select hack
            if (this.props?.enableUserSelectHack) removeUserSelectStyles(ownerDocument);
        }

        // 重置
        this.dragging = false;

        if (ownerDocument) {
            removeEvent(ownerDocument, dragEventFor.move, this.handleDrag);
            removeEvent(ownerDocument, dragEventFor.stop, this.handleDragStop);
            removeEvent(ownerDocument, dragEventFor.cancel, this.handleDragStop);
        }
    };


    render() {
        return React.cloneElement(React.Children.only(this.props?.children), {
            ref: this.props?.forwardedRef
        });
    }
}

const wrapper = function (InnerComponent: any) {
    return React.forwardRef((props, ref) => {
        return (
            <InnerComponent forwardedRef={ref} {...props} />
        )
    })
}

export default wrapper(DraggableEvent)

// // 拖拽事件组件
// const DraggableEvent = React.forwardRef<any, DraggableEventProps>((props, ref) => {

//     let draggingRef = useRef<boolean>(false);
//     let eventDataRef = useRef<EventData>();
//     const nodeRef = useRef<any>();


//     useImperativeHandle(ref, () => (findDOMNode()));

//     const findDOMNode = () => {
//         return nodeRef?.current;
//     }

//     // 顶层document对象（有的环境可能删除了document顶层环境）
//     const findOwnerDocument = () => {
//         const node = findDOMNode();
//         return node?.ownerDocument;
//     };

//     // 获取定位父元素, 涉及的位置相对于该父元素
//     const getLocationParent = () => {
//         const parent = findElement(props?.locationParent) || document.body || document.documentElement;
//         return parent;
//     }

//     // 拖拽句柄
//     const findHandle = () => {
//         const child = findDOMNode();
//         const childStyle = child?.ownerDocument?.defaultView?.getComputedStyle(child);
//         const handle = props.handle && findElement(props.handle) || child;
//         if (childStyle?.display === "inline") {
//             throw new Error("the style of `props.children` cannot is `inline`, because `transform` has no effect on Element ");
//         }
//         return handle;
//     };

//     // 禁止拖拽的节点
//     const findDisabledNode = () => {
//         const node = props.disabledNode && findElement(props.disabledNode);
//         return node;
//     };

//     useEffect(() => {
//         const ownerDocument = findOwnerDocument();
//         const handle = findHandle();
//         addEvent(handle, dragEventFor.start, handleDragStart);
//         return () => {
//             removeEvent(handle, dragEventFor.start, handleDragStart);
//             removeEvent(ownerDocument, dragEventFor.move, handleDrag);
//             removeEvent(ownerDocument, dragEventFor.stop, handleDragStop);
//             removeEvent(ownerDocument, dragEventFor.cancel, handleDragStop);
//             // 移除选中样式
//             if (props?.enableUserSelectHack) removeUserSelectStyles(ownerDocument);
//         };
//     }, []);

//     const handleDragStart = (e: EventType) => {
//         const handle = findHandle();
//         const disabledNode = findDisabledNode();
//         const child = findDOMNode();
//         const ownerDocument = findOwnerDocument();
//         e.preventDefault();

//         if (!ownerDocument) {
//             throw new Error('<DraggableEvent> not mounted on DragStart!');
//         }

//         // pc端鼠标操作时允许非左键操作
//         if (!props?.allowAnyClick && !isEventTouch(e) && typeof e.button === 'number' && e.button !== 0) return;
//         // 移动设备阻止默认行为
//         if (e.type === 'touchstart') e.preventDefault();

//         // props控制是否拖拽
//         if (props?.disabled ||
//             (!(e.target instanceof ownerDocument?.defaultView?.Node)) ||
//             (handle && !matchParent(e.target, handle)) ||
//             (disabledNode && matchParent(e.target, disabledNode))) {
//             return;
//         }

//         // locationParent内的位置
//         const parent = getLocationParent();
//         const positionXY = getEventPosition(e, parent);
//         if (!positionXY) return;
//         const positionX = positionXY?.x;
//         const positionY = positionXY?.y;

//         // 返回事件对象相关的位置信息
//         eventDataRef.current = {
//             node: child,
//             deltaX: 0,
//             deltaY: 0,
//             lastEventX: positionX,
//             lastEventY: positionY,
//             eventX: positionX,
//             eventY: positionY
//         };

//         // 如果没有完成渲染或者返回false则禁止拖拽
//         const shouldUpdate = props?.onDragStart && props?.onDragStart(e, eventDataRef.current);
//         if (shouldUpdate === false) return;

//         // 滚动过程中选中文本被添加样式
//         if (props?.enableUserSelectHack) addUserSelectStyles(ownerDocument);

//         draggingRef.current = true;
//         eventDataRef.current = {
//             ...eventDataRef.current,
//             lastEventX: positionX,
//             lastEventY: positionY
//         }

//         addEvent(ownerDocument, dragEventFor.move, handleDrag);
//         addEvent(ownerDocument, dragEventFor.stop, handleDragStop);
//         addEvent(ownerDocument, dragEventFor.cancel, handleDragStop);
//     };

//     const handleDrag = (e: EventType) => {
//         if (!draggingRef.current) return;
//         e.preventDefault();
//         // locationParent内的位置
//         const parent = getLocationParent();
//         const child = findDOMNode();
//         const positionXY = getEventPosition(e, parent);
//         if (!positionXY) return;
//         let positionX = positionXY?.x;
//         let positionY = positionXY?.y;

//         if (!eventDataRef.current) return;

//         // 拖拽跳跃,可设置多少幅度跳跃一次
//         const grid = props?.grid;
//         if (Array.isArray(grid)) {
//             const { lastEventX, lastEventY } = eventDataRef.current;
//             let deltaX = positionX - lastEventX, deltaY = positionY - lastEventY;
//             [deltaX, deltaY] = snapToGrid(grid, deltaX, deltaY);
//             if (!deltaX && !deltaY) return; // skip useless drag
//             positionX = lastEventX + deltaX, positionY = lastEventY + deltaY;
//         }

//         // 返回事件对象相关的位置信息
//         eventDataRef.current = {
//             node: child,
//             deltaX: positionX - eventDataRef?.current?.lastEventX,
//             deltaY: positionY - eventDataRef?.current?.lastEventY,
//             lastEventX: positionX,
//             lastEventY: positionY,
//             eventX: positionX,
//             eventY: positionY
//         }

//         // 返回false则禁止拖拽并初始化鼠标事件
//         const shouldUpdate = props?.onDrag && props?.onDrag(e, eventDataRef.current);
//         if (shouldUpdate === false) {
//             try {
//                 handleDragStop(new MouseEvent(e?.type));
//             } catch (err) {
//                 // 兼容废弃版本
//                 const event = document.createEvent('MouseEvents');
//                 event.initMouseEvent('mouseup', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
//                 handleDragStop(event);
//             }
//             return;
//         }
//     };

//     const handleDragStop = (e: EventType) => {
//         if (!draggingRef.current || !eventDataRef.current) return;
//         e.preventDefault();
//         const ownerDocument = findOwnerDocument();

//         eventDataRef.current = {
//             ...eventDataRef.current,
//             deltaX: 0,
//             deltaY: 0
//         }

//         const shouldContinue = props?.onDragStop && props?.onDragStop(e, eventDataRef.current);
//         if (shouldContinue === false) return;

//         // 移除文本因滚动造成的显示
//         if (ownerDocument) {
//             // Remove user-select hack
//             if (props?.enableUserSelectHack) removeUserSelectStyles(ownerDocument);
//         }

//         // 重置
//         draggingRef.current = false;

//         if (ownerDocument) {
//             removeEvent(ownerDocument, dragEventFor.move, handleDrag);
//             removeEvent(ownerDocument, dragEventFor.stop, handleDragStop);
//             removeEvent(ownerDocument, dragEventFor.cancel, handleDragStop);
//         }
//     };

//     return React.cloneElement(React.Children.only(props?.children), {
//         ref: nodeRef
//     });
// });

// export default DraggableEvent;
