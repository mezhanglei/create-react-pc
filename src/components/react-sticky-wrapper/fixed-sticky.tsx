import React, { useEffect, useRef, CSSProperties } from 'react';
import { addEvent, findElement, removeEvent, getClientXY, getScrollParent, getScroll, getPositionInParent, setStyle } from '@/utils/dom';
import { isMobile } from '@/utils/verify';
import classNames from 'classnames';
import ReactDOM from 'react-dom';

// 利用fixed实现的吸顶组件
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
    topDistance?: number; // 滚动时目标距离滚动根节点哪里开始吸顶
    style?: CSSProperties;
    className?: string;
}

const ReactFixedSticky: React.FC<ReactFixedStickyProps> = (props) => {
    const {
        children,
        scrollRoot,
        style,
        className
    } = props;

    const nodeRef = useRef<any>();
    const draggerRef = useRef<any>();

    // 获取滚动根元素
    const getScrollRoot = () => {
        console.log(findElement(scrollRoot))
        const root = findElement(scrollRoot) || getScrollParent(nodeRef.current);
        return root;
    }

    // 位置相对比较的父元素
    const findParent = () => {
        const ownerDocument = document;
        const node = ownerDocument?.body || ownerDocument?.documentElement;
        return node;
    };

    const findOwnerDocument = () => {
        return document;
    };

    useEffect(() => {
        const root = getScrollRoot();
        const addEventEle: any = root === (document.body || document.documentElement) ? (document || window) : root;
        const nodeObj = { node: nodeRef.current, initDistance: (getClientXY(nodeRef.current)?.y || 0) - (getClientXY(root)?.y || 0) + 1 }
        addEvent(addEventEle, dragEventFor.move, (e) => handleScroll(e, nodeObj, root));

        const ownerDocument = findOwnerDocument();
        const parent = findParent();
        draggerRef.current = ownerDocument.createElement('div');
        setStyle({
            opacity: 0,
            zIndex: -1,
            position: 'fixed'
        }, draggerRef.current);
        parent?.appendChild(draggerRef.current);
        ReactDOM.render(FixedChild, draggerRef.current);
        return () => {
            removeEvent(addEventEle, dragEventFor.move, handleScroll);
            parent?.removeChild(draggerRef.current);
        }
    }, []);

    const handleScroll = (e: MouseEvent | TouchEvent, nodeObj: { node: HTMLElement, initDistance: number }, root: HTMLElement) => {
        const node = nodeObj?.node;
        // 距离滚动根节点的初始距离
        const initDistance = nodeObj?.initDistance;
        // 距离滚动根节点多少开始吸顶
        const topDistance = props.topDistance || 0;
        // 根节点滚动的距离
        const rootScrollTop = getScroll(root)?.y || 0;
        // 滚动根节点到屏幕上方的距离
        const rootPositionY = getPositionInParent(root, findParent())?.y || 0;
        if (draggerRef.current) {
            draggerRef.current.style['top'] = rootPositionY + topDistance + 'px';
            if (rootScrollTop - initDistance < topDistance) {
                // console.log(rootScrollTop, '上');
                node.style['opacity'] = '1';
                draggerRef.current.style['opacity'] = 0;
                draggerRef.current.style['zIndex'] = -1;
            } else {
                // console.log(rootScrollTop, '下');
                node.style['opacity'] = '0';
                draggerRef.current.style['opacity'] = 1;
                draggerRef.current.style['zIndex'] = 0
            }
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