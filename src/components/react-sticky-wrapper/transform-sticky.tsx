import React, { useEffect, useRef, CSSProperties } from 'react';
import { addEvent, findElement, removeEvent, getScrollParent, getScroll, getRect, getInsideRange } from '@/utils/dom';
import { isMobile } from '@/utils/verify';
import { getPrefixStyle } from "@/utils/cssPrefix";
import classNames from 'classnames';

// 任意元素吸附固定组件
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

export interface ReactTransformStickyProps {
    children: any;
    scrollRoot?: HTMLElement | string; // 滚动根节点
    targetNodeList?: HTMLElement[] | string[]; // 目标需要吸顶的元素数组
    bounds?: { left?: number, top?: number }; // 小于设置值则固定
    style?: CSSProperties;
    className?: string;
}
export type ScrollNodeList = { node: HTMLElement, left: number, top: number }[];
const ReactTransformSticky: React.FC<ReactTransformStickyProps> = (props) => {
    const {
        children,
        scrollRoot,
        targetNodeList = [],
        bounds = { top: 0 },
        style,
        className
    } = props;

    const nodeRef = useRef<any>();

    // 目标需要吸顶的元素数组
    const findNodeList = () => {
        const root = getScrollRoot();
        const nodeList = targetNodeList?.length ? targetNodeList : [nodeRef.current];
        return nodeList?.map((selector) => {
            const node = findElement(selector);
            if (node) {
                // 目标在根节点内部的位置范围
                const isRoot = [document.documentElement, document.body].includes(root);
                const insideRange = isRoot ? getRect(node) : getInsideRange(node, root);
                if (insideRange) {
                    return {
                        node: node,
                        left: insideRange?.left,
                        top: insideRange?.top
                    }
                }
            }
        });
    };

    // 获取滚动根元素
    const getScrollRoot = () => {
        const root = findElement(scrollRoot) || getScrollParent(nodeRef.current);
        return root;
    }

    useEffect(() => {
        const root = getScrollRoot();
        const addEventEle: any = [document.documentElement, document.body].includes(root) ? (document || window) : root;
        const scrollNodeList = findNodeList() as Array<{ node: HTMLElement, left: number, top: number }>;
        addEvent(addEventEle, dragEventFor.move, (e) => handleScroll(e, scrollNodeList, root));
        return () => {
            removeEvent(addEventEle, dragEventFor.move, handleScroll);
        }
    }, []);

    const handleScroll = (e: MouseEvent | TouchEvent, scrollNodeList: ScrollNodeList, root: HTMLElement) => {
        scrollNodeList?.map((item) => {
            const node = item?.node;
            const initLeft = item?.left;
            const initTop = item?.top;

            const bounds_top = bounds?.top;
            const bounds_left = bounds?.left;

            const scrollX = getScroll(root)?.x || 0;
            const scrollY = getScroll(root)?.y || 0;

            const topTrigger = bounds_top || bounds_top === 0 ? (scrollY - initTop > bounds_top) : false;
            const leftTrigger = bounds_left || bounds_left === 0 ? scrollX - initLeft > bounds_left : false;
    
            if (topTrigger || leftTrigger) {
                if (topTrigger) {
                    node.style[getPrefixStyle('transform')] = `translate3d(0px,${scrollY - initTop + (bounds_top || 0)}px, 0)`
                } else if (leftTrigger) {
                    node.style[getPrefixStyle('transform')] = `translate3d(${scrollX - initLeft + (bounds_left || 0)}px,0px, 0)`
                }
            } else {
                node.style[getPrefixStyle('transform')] = '';
            }
        });
    }

    const cls = classNames((children?.props?.className || ''), className);

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

export default ReactTransformSticky;