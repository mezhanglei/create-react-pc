import React, { useEffect, useRef, CSSProperties } from 'react';
import { addEvent, findElement, removeEvent, getClientXY, getScrollParent, setStyle, getOffsetWH, getClientWH, getInsideRange, getRect } from '@/utils/dom';
import { isMobile } from '@/utils/verify';
import classNames from 'classnames';
import ReactDOM from 'react-dom';

// 利用fixed实现的吸附固定组件
// Simple abstraction for dragging events names.
const eventsFor = {
    touch: {
        move: 'scroll'
    },
    mouse: {
        move: 'scroll'
    }
};

// 根据当前设备看是否触发
let dragEventFor = isMobile() ? eventsFor.touch : eventsFor.mouse;

export interface ReactFixedStickyProps {
    children: any;
    scrollRoot?: HTMLElement | string; // 滚动根节点
    bounds?: { left?: number, top?: number, right?: number, bottom?: number }; // 小于设置值则固定
    style?: CSSProperties;
    className?: string;
}

const ReactFixedSticky: React.FC<ReactFixedStickyProps> = (props) => {
    const {
        children,
        scrollRoot,
        bounds = { top: 0, left:0 },
        style,
        className
    } = props;

    const nodeRef = useRef<any>();
    const stickyRef = useRef<any>();

    // 获取滚动根元素
    const getScrollRoot = () => {
        const root = findElement(scrollRoot) || getScrollParent(nodeRef.current);
        return root;
    }

    // 位置相对比较的父元素
    const findParent = () => {
        const ownerDocument = document;
        const node = ownerDocument?.documentElement;
        return node;
    };

    const findOwnerDocument = () => {
        return document;
    };

    useEffect(() => {
        const root = getScrollRoot();
        const node = nodeRef.current;
        const addEventEle: any = root === document.documentElement ? (document || window) : root;
        const initData = {
            node,
            root
        }
        addEvent(addEventEle, dragEventFor.move, (e) => handleScroll(e, initData));

        const ownerDocument = findOwnerDocument();
        const parent = findParent();
        stickyRef.current = ownerDocument.createElement('div');
        setStyle({
            opacity: 0,
            zIndex: -1,
            position: 'fixed'
        }, stickyRef.current);
        parent?.appendChild(stickyRef.current);
        ReactDOM.render(FixedChild, stickyRef.current);
        return () => {
            removeEvent(addEventEle, dragEventFor.move, handleScroll);
            parent?.removeChild(stickyRef.current);
        }
    }, []);

    const handleScroll = (e: MouseEvent | TouchEvent, data: { node: HTMLElement, root: HTMLElement }) => {

        const node = data?.node;
        const root = data?.root;
        // 目标在根节点内部的位置范围
        const isRoot = root === document.body || root === document.documentElement;
        const insideRange = isRoot ? getRect(node) : getInsideRange(node, root);
        if (!insideRange || !stickyRef.current) return;

        const leftTrigger = bounds?.left || bounds.left === 0 ? insideRange?.left < bounds?.left : false;
        const topTrigger = bounds?.top || bounds.top === 0 ? insideRange?.top < bounds?.top : false;
        const rightTrigger = bounds?.right || bounds.right === 0 ? insideRange.right < bounds?.right : false;
        const bottomTrigger = bounds?.bottom || bounds.bottom === 0 ? insideRange?.bottom < bounds?.bottom : false;

        if (leftTrigger || topTrigger || rightTrigger || bottomTrigger) {
            // 根节点的位置
            const baseLeft = Math.max(getClientXY(root)?.x || 0, 0);
            const baseTop = Math.max(getClientXY(root)?.y || 0);
            // 根节点的内边框宽高
            const insideW = getClientWH(root)?.width || 0;
            const insideH = getClientWH(root)?.height || 0;
            // 目标节点的外边框宽高
            const nodeOffsetW = getOffsetWH(node)?.width || 0;
            const nodeOffsetH = getOffsetWH(node)?.height || 0;

            if (leftTrigger) {
                stickyRef.current.style['left'] = baseLeft + (bounds.left || 0) + 'px';
            } else if (topTrigger) {
                stickyRef.current.style['top'] = baseTop + (bounds.top || 0) + 'px';
            } else if (rightTrigger) {
                stickyRef.current.style['left'] = insideW - (bounds.right || 0) - nodeOffsetW + 'px';
            } else if (bottomTrigger) {
                stickyRef.current.style['top'] = insideH - (bounds.bottom || 0) - nodeOffsetH + 'px';
            }

            node.style['opacity'] = '0';
            stickyRef.current.style['opacity'] = 1;
            stickyRef.current.style['zIndex'] = 0

        } else {
            node.style['opacity'] = '1';
            stickyRef.current.style['opacity'] = 0;
            stickyRef.current.style['zIndex'] = -1;
        }
    }

    const cls = classNames((children?.props?.className || ''), className);

    const FixedChild = React.cloneElement(React.Children.only(children), {
        className: cls,
        style: {
            ...children.props.style,
            ...style
        }
    });

    const NormalChild = React.cloneElement(React.Children.only(children), {
        ref: nodeRef,
        className: cls,
        style: {
            ...children.props.style,
            ...style
        }
    });

    return NormalChild;
}

export default ReactFixedSticky;