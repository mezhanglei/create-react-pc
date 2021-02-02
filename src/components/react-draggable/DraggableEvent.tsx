import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { matchParent, addEvent, removeEvent, getTouchIdentifier, getPositionInParent } from "@/utils/dom";
import { addUserSelectStyles, removeUserSelectStyles, snapToGrid } from "./utils/dom";
import { isNumber } from "@/utils/type";
import { isTouch } from "@/utils/reg";
import { DraggableEventProps, EventHandler, PositionInterface, EventType } from "./utils/types";
import { usePrevious } from "./utils/use-fn";

// Simple abstraction for dragging events names.
const eventsFor = {
    touch: {
        start: 'touchstart',
        move: 'touchmove',
        stop: 'touchend'
    },
    mouse: {
        start: 'mousedown',
        move: 'mousemove',
        stop: 'mouseup'
    }
};

// 根据当前设备看是否触发
let dragEventFor = isTouch() ? eventsFor.touch : eventsFor.mouse;


// // 拖拽组件-事件处理
// class DraggableEvents extends React.Component {

//     // 用于调试消息(jsx特性)
//     static displayName = 'DraggableEvent';

//     static defaultProps = {
//         allowAnyClick: false,
//         cancel: null,
//         disabled: false,
//         enableUserSelectHack: true,
//         boundsParent: null,
//         handle: null,
//         grid: null,
//         transform: null,
//         onStart: function () { },
//         onDrag: function () { },
//         onStop: function () { },
//         scale: 1,
//     };

//     state = {
//         dragging: false,
//         // Used while dragging to determine deltas.
//         lastX: NaN, lastY: NaN,
//         touchIdentifier: null
//     };

//     mounted = false;

//     componentDidMount() {
//         this.mounted = true;
//         const thisNode = this.findDOMNode();
//         if (thisNode) {
//             // 监听touch事件时,不阻止默认行为
//             addEvent(thisNode, dragEventFor.start, this.onTouchStart, { passive: false });
//         }
//     }

//     componentWillUnmount() {
//         this.mounted = false;
//         // 其中: 删除顶层document对象的事件以防万一
//         const thisNode = this.findDOMNode();
//         if (thisNode) {
//             const { ownerDocument } = thisNode;
//             removeEvent(ownerDocument, dragEventFor.move, this.handleDrag);
//             removeEvent(ownerDocument, dragEventFor.stop, this.handleDragStop);
//             removeEvent(thisNode, dragEventFor.start, this.onTouchStart, { passive: false });
//             // 移除选中样式
//             if (this.props.enableUserSelectHack) removeUserSelectStyles(ownerDocument);
//         }
//     }

//     // 节点
//     findDOMNode() {
//         return this.props.nodeRef ? this.props.nodeRef.current : ReactDOM.findDOMNode(this);
//     }

//     // 返回拖拽位置信息
//     createEventData(x, y) {
//         const { lastX, lastY } = this.state;
//         const node = this.findDOMNode();

//         if (isNumber(lastX)) {
//             return {
//                 node,
//                 // 移动一次的距离
//                 deltaX: x - lastX,
//                 deltaY: y - lastY,
//                 // 拖拽前位置
//                 lastX: lastX, lastY: lastY,
//                 x, y
//             };
//         } else {
//             return {
//                 node,
//                 deltaX: 0,
//                 deltaY: 0,
//                 lastX: x,
//                 lastY: y,
//                 x, y
//             };
//         }
//     }

//     handleDragStart = (e) => {

//         // 不是鼠标左键且不开启allowAnyClick则不生效
//         if (!this.props.allowAnyClick && typeof e.button === 'number' && e.button !== 0) return false;

//         // 判断是否渲染完成
//         const thisNode = this.findDOMNode();
//         if (!thisNode || !thisNode.ownerDocument || !thisNode.ownerDocument.body) {
//             throw new Error('<DraggableEvent> not mounted on DragStart!');
//         }
//         const { ownerDocument } = thisNode;

//         // props控制是否拖拽
//         if (this.props.disabled ||
//             (!(e.target instanceof ownerDocument.defaultView.Node)) ||
//             (this.props.handle && !matchParent(e.target, this.props.handle, thisNode)) ||
//             (this.props.cancel && matchParent(e.target, this.props.cancel, thisNode))) {
//             return;
//         }

//         // 移动设备阻止默认行为
//         if (e.type === 'touchstart') e.preventDefault();

//         // 触摸设备获取触摸标识符,用于区分多点触控
//         const touchIdentifier = getTouchIdentifier(e);
//         this.setState({ touchIdentifier });

//         // 获取在指定父元素内的位置
//         const parent = this.props.boundsParent || thisNode.ownerDocument.body;
//         const position = getPositionInParent(e, parent) || {};
//         const { x, y } = position;

//         // 返回事件对象相关的位置信息
//         const eventData = this.createEventData(x, y);

//         // 如果没有完成渲染或者返回false则禁止拖拽
//         const shouldUpdate = this.props.onStart(e, eventData);
//         if (shouldUpdate === false || this.mounted === false) return;

//         // 滚动过程中选中文本被添加样式
//         if (this.props.enableUserSelectHack) addUserSelectStyles(ownerDocument);

//         this.setState({
//             dragging: true,
//             lastX: x, // 拖拽前位置
//             lastY: y
//         });

//         addEvent(ownerDocument, dragEventFor.move, this.handleDrag);
//         addEvent(ownerDocument, dragEventFor.stop, this.handleDragStop);
//     };

//     handleDrag = (e) => {

//         // 获取在指定父元素内的位置
//         const thisNode = this.findDOMNode();
//         const parent = this.props.boundsParent || thisNode.ownerDocument.body;
//         const position = getPositionInParent(e, parent) || {};
//         let { x, y } = position;

//         // 拖拽跳跃,可设置多少幅度跳跃一次
//         if (Array.isArray(this.props.grid)) {
//             let deltaX = x - this.state.lastX, deltaY = y - this.state.lastY;
//             [deltaX, deltaY] = snapToGrid(this.props.grid, deltaX, deltaY);
//             if (!deltaX && !deltaY) return; // skip useless drag
//             x = this.state.lastX + deltaX, y = this.state.lastY + deltaY;
//         }

//         // 返回事件对象相关的位置信息
//         const eventData = this.createEventData(x, y);

//         // 返回false则禁止拖拽并初始化鼠标事件
//         const shouldUpdate = this.props.onDrag(e, eventData);
//         if (shouldUpdate === false || this.mounted === false) {
//             try {
//                 this.handleDragStop(new MouseEvent('mouseup'));
//             } catch (err) {
//                 // 兼容废弃版本
//                 const event = document.createEvent('MouseEvents');
//                 event.initMouseEvent('mouseup', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
//                 this.handleDragStop(event);
//             }
//             return;
//         }

//         this.setState({
//             lastX: x,
//             lastY: y
//         });
//     };

//     handleDragStop = (e) => {
//         if (!this.state.dragging) return;

//         // 获取在指定父元素内的位置
//         const thisNode = this.findDOMNode();
//         const parent = this.props.boundsParent || thisNode.ownerDocument.body;
//         const position = getPositionInParent(e, parent) || {};
//         const { x, y } = position;
//         const eventData = this.createEventData(x, y);

//         const shouldContinue = this.props.onStop(e, eventData);
//         if (shouldContinue === false || this.mounted === false) return false;

//         // 移除文本因滚动造成的显示
//         if (thisNode) {
//             // Remove user-select hack
//             if (this.props.enableUserSelectHack) removeUserSelectStyles(thisNode.ownerDocument);
//         }

//         // 重置
//         this.setState({
//             dragging: false,
//             lastX: NaN,
//             lastY: NaN
//         });

//         if (thisNode) {
//             removeEvent(thisNode.ownerDocument, dragEventFor.move, this.handleDrag);
//             removeEvent(thisNode.ownerDocument, dragEventFor.stop, this.handleDragStop);
//         }
//     };

//     render() {
//         // 注意使用时, 子元素最好用闭合标签包裹, 以防出现props带来的问题(例如style样式中的transition和transform, 以及事件)
//         return React.cloneElement(React.Children.only(this.props.children), {
//             onMouseDown: this.handleDragStart,
//             onTouchStart: this.handleDragStart,
//             onMouseUp: this.handleDragStop,
//             onTouchEnd: this.handleDragStop
//         });
//     }
// }



const DraggableEvent: React.FC<DraggableEventProps> = (props) => {

    const {
        children,
        onStart,
        onDrag,
        onStop,
        allowAnyClick,
        disabled,
        handle,
        cancel,
        enableUserSelectHack,
        grid,
        boundsParent
    } = props;

    let dragging = usePrevious<boolean>(false);
    let lastX = usePrevious<number>(NaN);
    let lastY = usePrevious<number>(NaN);
    let mounted = usePrevious<boolean>(false);


    useEffect(() => {
        mounted = true;
        const thisNode = findDOMNode();
        console.log(thisNode)
        if (thisNode) {
            // 监听touch事件时,不阻止默认行为
            addEvent(thisNode, dragEventFor.start, handleDragStart, { passive: false });
        }

        return () => {
            mounted = false;
            // 其中: 删除顶层document对象的事件以防万一
            const thisNode = findDOMNode();
            if (thisNode) {
                const { ownerDocument } = thisNode;
                removeEvent(ownerDocument, dragEventFor.move, handleDrag);
                removeEvent(ownerDocument, dragEventFor.stop, handleDragStop);
                removeEvent(thisNode, dragEventFor.start, handleDragStart, { passive: false });
                // 移除选中样式
                if (enableUserSelectHack) removeUserSelectStyles(ownerDocument);
            }
        }
    }, [])

    // 节点
    const findDOMNode = () => {
        return document.querySelector(handle)
    }

    // 返回拖拽位置信息
    const createEventData = (x: number, y: number): PositionInterface => {
        const node = findDOMNode();
        if (isNumber(lastX)) {
            return {
                node,
                // 移动一次的距离
                deltaX: x - lastX,
                deltaY: y - lastY,
                // 拖拽前位置
                lastX: lastX, lastY: lastY,
                x, y
            };
        } else {
            return {
                node,
                deltaX: 0,
                deltaY: 0,
                lastX: x,
                lastY: y,
                x, y
            };
        }
    }

    const handleDragStart: EventHandler<EventType> = (e) => {

        // 不是鼠标左键且不开启allowAnyClick则不生效
        if (!allowAnyClick && typeof e.button === 'number' && e.button !== 0) return false;

        // 判断是否渲染完成
        const thisNode = findDOMNode();
        if (!thisNode || !thisNode.ownerDocument || !thisNode.ownerDocument.body) {
            throw new Error('<DraggableEvent> not mounted on DragStart!');
        }
        const { ownerDocument } = thisNode;

        // props控制是否拖拽
        if (disabled ||
            (!(e.target instanceof ownerDocument.defaultView.Node)) ||
            (handle && !matchParent(e.target, handle, thisNode)) ||
            (cancel && matchParent(e.target, cancel, thisNode))) {
            return;
        }

        // 移动设备阻止默认行为
        if (e.type === 'touchstart') e.preventDefault();

        // 获取在指定父元素内的位置
        const parent = document.querySelector(boundsParent) || thisNode.ownerDocument.body;
        const position = getPositionInParent(e, parent) || {};
        const { x, y } = position;

        // 返回事件对象相关的位置信息
        const eventData = createEventData(x, y);

        // 如果没有完成渲染或者返回false则禁止拖拽
        const shouldUpdate = onStart && onStart(e, eventData);
        if (shouldUpdate === false || mounted === false) return;

        // 滚动过程中选中文本被添加样式
        if (enableUserSelectHack) addUserSelectStyles(ownerDocument);

        dragging = true;
        lastX = x;
        lastY = y;

        addEvent(ownerDocument, dragEventFor.move, handleDrag);
        addEvent(ownerDocument, dragEventFor.stop, handleDragStop);
    };

    const handleDrag: EventHandler<EventType> = (e) => {

        // 获取在指定父元素内的位置
        const thisNode = findDOMNode();
        const parent = document.querySelector(boundsParent) || thisNode.ownerDocument.body;
        const position = getPositionInParent(e, parent) || {};
        let { x, y } = position;

        // 拖拽跳跃,可设置多少幅度跳跃一次
        if (Array.isArray(grid)) {
            let deltaX = x - lastX, deltaY = y - lastY;
            [deltaX, deltaY] = snapToGrid(grid, deltaX, deltaY);
            if (!deltaX && !deltaY) return; // skip useless drag
            x = lastX + deltaX, y = lastY + deltaY;
        }

        // 返回事件对象相关的位置信息
        const eventData = createEventData(x, y);

        // 返回false则禁止拖拽并初始化鼠标事件
        const shouldUpdate = onDrag && onDrag(e, eventData);
        if (shouldUpdate === false || mounted === false) {
            try {
                handleDragStop(new MouseEvent('mouseup'));
            } catch (err) {
                // 兼容废弃版本
                const event = document.createEvent('MouseEvents');
                event.initMouseEvent('mouseup', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                handleDragStop(event);
            }
            return;
        }

        lastX = x;
        lastY = y;
    };

    const handleDragStop: EventHandler<EventType> = (e) => {
        if (!dragging) return;

        // 获取在指定父元素内的位置
        const thisNode = findDOMNode();
        const parent = document.querySelector(boundsParent) || thisNode.ownerDocument.body;
        const position = getPositionInParent(e, parent) || {};
        const { x, y } = position;
        const eventData = createEventData(x, y);

        const shouldContinue = onStop && onStop(e, eventData);
        if (shouldContinue === false || mounted === false) return false;

        // 移除文本因滚动造成的显示
        if (thisNode) {
            // Remove user-select hack
            if (enableUserSelectHack) removeUserSelectStyles(thisNode.ownerDocument);
        }

        // 重置
        dragging = false;
        lastX = NaN;
        lastY = NaN;

        if (thisNode) {
            removeEvent(thisNode.ownerDocument, dragEventFor.move, handleDrag);
            removeEvent(thisNode.ownerDocument, dragEventFor.stop, handleDragStop);
        }
    };

    return React.cloneElement(React.Children.only(children), {
        onMouseDown: handleDragStart,
        onTouchStart: handleDragStart,
        onMouseUp: handleDragStop,
        onTouchEnd: handleDragStop
    });
};

export default DraggableEvent;
