import { isMobile } from '@/utils/verify';
import React from 'react';
import { DrawItemProps, EventType } from './types';
import "./index.less"

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

const wrapStyle = {
    left: 100,
    top: 100,
    width: 500,
    height: 500
}

export interface BoardContextInterface {

}

export const BoardContext = React.createContext<BoardContextInterface | null>(null);

export const DrawBoard = (props: { children: any }) => {
    return (
        <div className="drawing-wrap">
            {props?.children}
        </div>
    );
}

export class DrawItem extends React.Component<DrawItemProps, {}> {
    dragging: boolean;
    constructor(props: any) {
        super(props);
        this.dragging = false;
        this.oriPos = {
            top: 0, // 元素的坐标
            left: 0,
            cX: 0, // 鼠标的坐标
            cY: 0
        }
        this.child = {};
        this.state = {
            style: {
                left: 100,
                top: 100,
                width: 100,
                height: 100
            }
        };
    }

    transform(direction, oriPos, e) {
        const style = { ...oriPos }
        const offsetX = e.clientX - oriPos.cX;
        const offsetY = e.clientY - oriPos.cY;
        switch (direction) {
            // 拖拽移动
            case 'move':
                // 元素当前位置 + 偏移量
                const top = oriPos.top + offsetY;
                const left = oriPos.left + offsetX;
                // 限制必须在这个范围内移动 画板的高度-元素的高度
                style.top = Math.max(0, Math.min(top, wrapStyle.height - style.height));
                style.left = Math.max(0, Math.min(left, wrapStyle.width - style.width));
                break
            // 东
            case 'e':
                // 向右拖拽添加宽度
                style.width += offsetX;
                return style
            // 西
            case 'w':
                // 增加宽度、位置同步左移
                style.width -= offsetX;
                style.left += offsetX;
                return style
            // 南
            case 's':
                style.height += offsetY;
                return style
            // 北
            case 'n':
                style.height -= offsetY;
                style.top += offsetY;
                break
            // 东北
            case 'ne':
                style.height -= offsetY;
                style.top += offsetY;
                style.width += offsetX;
                break
            // 西北
            case 'nw':
                style.height -= offsetY;
                style.top += offsetY;
                style.width -= offsetX;
                style.left += offsetX;
                break
            // 东南
            case 'se':
                style.height += offsetY;
                style.width += offsetX;
                break
            // 西南
            case 'sw':
                style.height += offsetY;
                style.width -= offsetX;
                style.left += offsetX;
                break
            // 拖拽移动
            case 'rotate':
                // 先计算下元素的中心点, x，y 作为坐标原点
                const x = style.width / 2 + style.left;
                const y = style.height / 2 + style.top;
                // 当前的鼠标坐标
                const x1 = e.clientX;
                const y1 = e.clientY;
                // 运用高中的三角函数
                style.transform = `rotate(${(Math.atan2((y1 - y), (x1 - x))) * (180 / Math.PI) - 90}deg)`;
                break
        }
        return style
    }

    onMouseDown(dir, e: EventType) {
        // 阻止事件冒泡
        e.stopPropagation();
        // 保存方向。
        this.direction = dir;
        this.dragging = true;
        // 然后鼠标坐标是
        const cY = e.clientY; // clientX 相对于可视化区域
        const cX = e.clientX;
        this.oriPos = {
            ...this.state.style,
            cX, cY
        }
    }

    onMouseUp(e: EventType) {
        this.dragging = false;
    }

    MouseMove(e) {
        if (!this.dragging) return
        let newStyle = this.transform(this.direction, oriPos, e);
        this.setState({
            style: newStyle
        })
    }

    render() {

        const {
            children,
            forwardedRef,
            className,
            style
        } = this.props;

        const originStyle = (attr: string) => {
            return style?.[attr] ?? children.props.style[attr];
        }

        return React.cloneElement(React.Children.only(children), {
            className: className ?? children.props?.className,
            ref: forwardedRef,
            style: {
                ...children.props?.style,
                ...style,
                position: 'absolute'
            }
        });
    }
}