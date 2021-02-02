import * as React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { createCSSTransform, createSVGTransform, getPositionByBounds } from './utils/dom';
import DraggableEvent from './DraggableEvent';

/**
 * 拖拽组件-回调处理(通过transform来控制元素拖拽, 不影响页面布局)
 * allowAnyClick:  boolean true表示允许非鼠标左键单击拖动
 * disabled: boolean true禁止拖拽
 * enableUserSelectHack: boolean 允许添加选中样式
 * boundsParent: HTMLElement | function 限制父元素
 * grid: [number, number] 跳跃幅度, 例如: [25, 25]表示x, y轴25移动距离跳跃一次
 * handle: string 拖拽子元素所在的类选择器
 * cancel: string 不允许拖拽的类选择器
 * nodeRef: ref 拖拽组件的ref
 * onStart: function(e, coreEvent) { } 拖拽开始事件, 返回false终止, coreEvent: {node: 节点,deltaX: x方向移动一次的距离, deltaY: y方向移动一次的距离, lastX: x方向移动前位置, lastY: y方向移动前位置, x: x位置, y: y位置}
 * onDrag: function(e, coreEvent) { } 拖拽进行事件, 返回false终止, coreEvent: {node: 节点,deltaX: x方向移动一次的距离, deltaY: y方向移动一次的距离, lastX: x方向移动前位置, lastY: y方向移动前位置, x: x位置, y: y位置}
 * onStop: function(e, coreEvent) { } 拖拽结束事件, 返回false终止, coreEvent: {node: 节点,deltaX: x方向移动一次的距离, deltaY: y方向移动一次的距离, lastX: x方向移动前位置, lastY: y方向移动前位置, x: x位置, y: y位置}
 * scale: 1 拖拽比例
 * style: object 包裹的子元素样式, 需要在子元素上设置
 * transform: object 包裹的子元素的tansform样式, 需要在子元素上设置
 * className: string 类名,需要在子元素上设置
 * 
 * axis: 'both' | 'x' | 'y' | 'none' 设置拖拽轴
 * bounds: object | string  当为object时: {left?: number, top?: number, right?: number, bottom?: number}表示边界,相对于定位父元素的位置范围, 当为string时表示定位父元素类选择器
 * defaultClassNameDragging: string 默认拖拽进行中会添加上的类名
 * defaultClassNameDragged: string 默认拖拽过的元素会添加上的类名
 * defaultPosition: object 默认拖拽元素所在的位置, 如{x:number, y: number}
 * position: object 设置拖拽元素所在的位置, 如{x:number, y: number}
 * positionOffset: object transform的位置增量,如{x:number, y: number}
 */
class Draggable extends React.Component {

    static displayName = 'Draggable';

    static defaultProps = {
        ...DraggableEvent.defaultProps,
        axis: 'both',
        bounds: false,
        defaultClassName: 'react-draggable',
        defaultClassNameDragging: 'react-draggable-dragging',
        defaultClassNameDragged: 'react-draggable-dragged',
        defaultPosition: { x: 0, y: 0 },
        position: null,
        scale: 1
    };

    // 此生命周期注意保存一个旧值用来比较nextProps，并且不要有副作用
    static getDerivedStateFromProps(nextProps, prevState) {
        const { position } = nextProps;
        const { prevPropsPosition } = prevState;
        if (
            position &&
            (!prevPropsPosition ||
                position.x !== prevPropsPosition.x || position.y !== prevPropsPosition.y
            )
        ) {
            return {
                x: position.x,
                y: position.y,
                prevPropsPosition: { ...position }
            };
        }
        return null;
    }

    constructor(props) {
        super(props);

        this.state = {
            dragging: false,
            dragged: false,
            x: props.position ? props.position.x : props.defaultPosition.x,
            y: props.position ? props.position.y : props.defaultPosition.y,
            prevPropsPosition: { ...props.position },
            // 越界补偿
            slackX: 0, slackY: 0,
            // Can only determine if SVG after mounting
            isElementSVG: false
        };

        if (props.position && !(props.onDrag || props.onStop)) {
            // eslint-disable-next-line no-console
            console.warn('A `position` was applied to this <Draggable>, without drag handlers. This will make this ' +
                'component effectively undraggable. Please attach `onDrag` or `onStop` handlers so you can adjust the ' +
                '`position` of this element.');
        }
    }

    componentDidMount() {
        // Check to see if the element passed is an instanceof SVGElement
        if (typeof window.SVGElement !== 'undefined' && this.findDOMNode() instanceof window.SVGElement) {
            this.setState({ isElementSVG: true });
        }
    }

    componentWillUnmount() {
        this.setState({ dragging: false }); // prevents invariant if unmounted while dragging
    }

    canDragX = () => {
        return this.props.axis === 'both' || this.props.axis === 'x';
    }

    canDragY = () => {
        return this.props.axis === 'both' || this.props.axis === 'y';
    }

    createDraggableData = (eventData) => {
        const scale = this.props.scale;
        const { x, y } = this.state;
        return {
            node: eventData.node,
            x: x + (eventData.deltaX / scale),
            y: y + (eventData.deltaY / scale),
            deltaX: (eventData.deltaX / scale),
            deltaY: (eventData.deltaY / scale),
            lastX: x,
            lastY: y
        };
    }

    // 节点
    findDOMNode() {
        return this.props.nodeRef ? this.props.nodeRef.current : ReactDOM.findDOMNode(this);
    }

    onDragStart = (e, data) => {

        // 如果onStart函数返回false则禁止拖拽
        const shouldStart = this.props.onStart && this.props.onStart(e, this.createDraggableData(data));
        if (shouldStart === false) return false;

        this.setState({ dragging: true, dragged: true });
    };

    onDrag = (e, data) => {
        if (!this.state.dragging) return false;

        // 拖拽生成的位置信息
        const uiData = this.createDraggableData(data);

        const newState = {
            x: uiData.x,
            y: uiData.y
        };

        // 运动边界限制
        if (this.props.bounds || this.props.boundsParent) {
            // Save original x and y.
            const { x, y } = newState;

            // 
            newState.x += this.state.slackX;
            newState.y += this.state.slackY;

            // 边界处理
            const node = document.querySelector(this.props.handle);
            const parent = this.props.boundsParent || this.findDOMNode().ownerDocument.body;

            const newPosition = getPositionByBounds(node, parent, newState, this.props.bounds);
            newState.x = newPosition.x;
            newState.y = newPosition.y;

            // 重新计算越界补偿
            newState.slackX = this.state.slackX + (x - newState.x);
            newState.slackY = this.state.slackY + (y - newState.y);

            // 更新
            uiData.x = newState.x;
            uiData.y = newState.y;
            uiData.deltaX = newState.x - this.state.x;
            uiData.deltaY = newState.y - this.state.y;
        }


        const shouldUpdate = this.props.onDrag && this.props.onDrag(e, uiData);
        if (shouldUpdate === false) return false;

        this.setState(newState);
    };

    onDragStop = (e, data) => {
        if (!this.state.dragging) return false;

        // Short-circuit if user's callback killed it.
        const shouldContinue = this.props.onStop && this.props.onStop(e, this.createDraggableData(data));
        if (shouldContinue === false) return false;

        const newState = {
            dragging: false,
            slackX: 0,
            slackY: 0
        };

        // 如果是受控组件,则需要重置位置为最近一次的position
        const controlled = Boolean(this.props.position);
        if (controlled) {
            const { x, y } = this.props.position;
            newState.x = x;
            newState.y = y;
        }

        this.setState(newState);
    };

    render() {
        const {
            axis,
            bounds,
            children,
            defaultPosition,
            defaultClassName,
            defaultClassNameDragging,
            defaultClassNameDragged,
            position,
            positionOffset,
            scale,
            ...DraggableEventProps
        } = this.props;

        let style = {};
        let svgTransform = null;

        // 判断
        const draggable = !Boolean(position) || this.state.dragging;

        // 设置的tranform的位置
        const validPosition = position || defaultPosition;
        const transformOpts = {
            // Set left if horizontal drag is enabled
            x: this.canDragX() && draggable ?
                this.state.x :
                validPosition.x,

            // Set top if vertical drag is enabled
            y: this.canDragY() && draggable ?
                this.state.y :
                validPosition.y
        };

        // If this element was SVG, we use the `transform` attribute.
        // 如果子元素已经设置了transform,可以用一对标签包裹
        if (this.state.isElementSVG) {
            svgTransform = createSVGTransform(transformOpts, positionOffset);
        } else {
            style = createCSSTransform(transformOpts, positionOffset);
        }
        //  else {
        //     console.error("'inline' type of children is not support");
        // }

        // 注意: 自定义className需要在子元素children上面设置
        const className = classNames((children.props.className || ''), defaultClassName, {
            [defaultClassNameDragging]: this.state.dragging,
            [defaultClassNameDragged]: this.state.dragged
        });

        // React.Children.only限制只能传递一个child
        // 注意使用时, 子元素最好用闭合标签包裹, 以防出现props带来的问题(例如style样式中的transition和transform, 以及事件)
        return (
            <DraggableEvent {...DraggableEventProps} onStart={this.onDragStart} onDrag={this.onDrag} onStop={this.onDragStop}>
                {React.cloneElement(React.Children.only(children), {
                    className: className,
                    style: { ...children.props.style, ...style },
                    transform: svgTransform
                })}
            </DraggableEvent>
        );
    }
}

export { Draggable as default, DraggableEvent };
