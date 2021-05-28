import React, { useState, useEffect, useRef } from 'react';
import { addEvent, findElement, removeEvent, getClientXY, getScrollParent, getScroll } from '@/utils/dom';
import { isMobile } from '@/utils/verify';
import { getPrefixStyle } from '@/utils/cssPrefix';

// 任意元素吸顶组件
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

export interface ScrollToTopProps {
    children: any;
    scrollRoot?: HTMLElement | string; // 滚动根节点
    targetNodeList?: HTMLElement[] | string[]; // 目标需要吸顶的元素数组
    topDistance?: number; // 滚动时目标距离滚动根节点哪里开始吸顶
}
export type ScrollNodeList = { node: HTMLElement, initDistance: number }[];
const ScrollToTop: React.FC<ScrollToTopProps> = (props) => {
    const {
        children,
        scrollRoot,
        targetNodeList
    } = props;

    const nodeRef = useRef<any>();

    // 目标需要吸顶的元素数组
    const findNodeList = (): ScrollNodeList => {
        const root = getScrollRoot();
        const filterList = targetNodeList?.map((dom: HTMLElement | string) =>
            findElement(dom) &&
            {
                node: findElement(dom),
                initDistance: (getClientXY(findElement(dom))?.y || 0) - (getClientXY(root)?.y || 0)
            })?.filter((item) => !!item) || [{ node: nodeRef.current, initDistance: (getClientXY(nodeRef.current)?.y || 0) - (getClientXY(root)?.y || 0) }]
        return filterList;
    };

    // 获取滚动根元素
    const getScrollRoot = () => {
        const root = findElement(scrollRoot) || getScrollParent(nodeRef.current);
        return root;
    }

    useEffect(() => {
        const root = getScrollRoot();
        const addEventEle: any = root === (document.body || document.documentElement) ? (document || window) : root;
        let nodeList = findNodeList();
        addEvent(addEventEle, dragEventFor.move, (e) => handleScroll(e, nodeList, root));
        return () => {
            removeEvent(addEventEle, dragEventFor.move, handleScroll);
        }
    }, []);

    const handleScroll = (e: MouseEvent | TouchEvent, nodeList: ScrollNodeList, root: HTMLElement) => {
        nodeList.map((item) => {
            const node = item?.node;
            // 距离滚动根节点的初始距离
            const initDistance = item?.initDistance;
            // 距离滚动根节点多少开始吸顶
            const topDistance = props.topDistance || 0;
            // 根节点滚动的距离
            const rootScrollTop = getScroll(root)?.y || 0;
            // 要向下滚动的高度 = 根节点的scrollTop - (目标距离滚动根节点初始距离 - topDistance)
            const transform = `translateY(${rootScrollTop - (initDistance - topDistance)}px)`;

            if (rootScrollTop - initDistance < topDistance) {
                // console.log(rootScrollTop, '上');
                node.style[getPrefixStyle('transform')] = 'translateY(0)';
            } else {
                // console.log(rootScrollTop, '下');
                node.style[getPrefixStyle('transform')] = transform;
            }
        });
    }

    return React.cloneElement(React.Children.only(children), {
        ref: nodeRef
    });
}

export default ScrollToTop;