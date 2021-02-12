import { getPrefixStyle } from "@/utils/cssPrefix";
import { isDom, isNumber } from "@/utils/type";
import { isContains, findElement } from "@/utils/dom";
import { CSSProperties } from "react";
import { BoundsInterface } from "./types";

// 添加选中类和样式
export const addUserSelectStyles = (doc: any): any => {
    if (!doc) return;
    let styleEl = doc.getElementById('react-draggable-style-el');
    if (!styleEl) {
        styleEl = doc.createElement('style');
        styleEl.type = 'text/css';
        styleEl.id = 'react-draggable-style-el';
        styleEl.innerHTML = '.react-draggable-transparent-selection *::-moz-selection {background: red;}\n';
        styleEl.innerHTML += '.react-draggable-transparent-selection *::selection {background: red;}\n';
        doc.getElementsByTagName('head')[0].appendChild(styleEl);
    }
    if (doc.body) addClassName(doc.body, 'react-draggable-transparent-selection');
};

// 移除选中样式和选中区域
export function removeUserSelectStyles(doc: any): void {
    if (!doc) return;
    try {
        if (doc.body) removeClassName(doc.body, 'react-draggable-transparent-selection');
        // $FlowIgnore: IE
        if (doc.selection) {
            // $FlowIgnore: IE
            doc.selection.empty();
        } else {
            // Remove selection caused by scroll, unless it's a focused input
            // (we use doc.defaultView in case we're in an iframe)
            const selection = (doc.defaultView || window).getSelection();
            if (selection && selection.type !== 'Caret') {
                selection.removeAllRanges();
            }
        }
    } catch (e) {
        // probably IE
    }
}

// 添加类名
export function addClassName(el: HTMLElement, className: string): void {
    if (el.classList) {
        el.classList.add(className);
    } else {
        if (!el.className.match(new RegExp(`(?:^|\\s)${className}(?!\\S)`))) {
            el.className += ` ${className}`;
        }
    }
}

// 移除类名
export function removeClassName(el: HTMLElement, className: string): void {
    if (el.classList) {
        el.classList.remove(className);
    } else {
        el.className = el.className.replace(new RegExp(`(?:^|\\s)${className}(?!\\S)`, 'g'), '');
    }
}

// 输入值，返回0或该值
export function snapToGrid(grid: [number, number], pendingX: number, pendingY: number): [number, number] {
    const x = Math.round(pendingX / grid[0]) * grid[0];
    const y = Math.round(pendingY / grid[1]) * grid[1];
    return [x, y];
}

// 位置
export interface PositionInterface {
    x: number,
    y: number
}
// 接收增量位置，返回新的transform值
export function getTranslation(current: PositionInterface, positionOffset: PositionInterface | undefined, unit: string): string {
    let translation = `translate(${current.x}${unit},${current.y}${unit})`;
    if (positionOffset) {
        const defaultX = `${(typeof positionOffset.x === 'string') ? positionOffset.x : positionOffset.x + unit}`;
        const defaultY = `${(typeof positionOffset.y === 'string') ? positionOffset.y : positionOffset.y + unit}`;
        translation = `translate(${defaultX}, ${defaultY})` + translation;
    }
    return translation;
}

// 设置css的transform
export function createCSSTransform(current: PositionInterface, positionOffset?: PositionInterface | undefined): CSSProperties {
    const translation = getTranslation(current, positionOffset, 'px');
    return { [getPrefixStyle('transform')]: translation };
}

// 设置svg的transform
export function createSVGTransform(current: PositionInterface, positionOffset?: PositionInterface | undefined): string {
    const translation = getTranslation(current, positionOffset, '');
    return translation;
}

// 返回目标元素相对于父元素内的视口范围
export function getBoundsInParent(node: HTMLElement, parent: any): BoundsInterface | undefined {
    // 限制父元素
    const boundsParent: HTMLElement = findElement(parent);

    if (!isDom(node) || !isDom(boundsParent)) {
        return;
    }
    if (!isContains(boundsParent, node)) {
        throw new Error("`parent` is not parentNode of the child");
    }
    const nodeStyle: any = node?.ownerDocument?.defaultView?.getComputedStyle(node);

    // 元素外部大小
    const nodeOutWidth = node.clientWidth + parseInt(nodeStyle?.borderLeftWidth) + parseInt(nodeStyle?.borderRightWidth);
    const nodeOutHeight = node.clientHeight + parseInt(nodeStyle?.borderTopWidth) + parseInt(nodeStyle?.borderBottomWidth);
    // 容器大小
    const parentInnerWidth = boundsParent.clientWidth;
    const parentInnerHeight = boundsParent.clientHeight;

    // 大小差距
    const xDiff = parentInnerWidth - nodeOutWidth;
    const yDiff = parentInnerHeight - nodeOutHeight;

    return {
        xStart: 0,
        xEnd: xDiff > 0 ? xDiff : 0,
        yStart: 0,
        yEnd: yDiff > 0 ? yDiff : 0
    };
}

// 元素在父元素限制范围下的位置
export function getPositionByBounds(node: HTMLElement, parent: any, position: PositionInterface, bounds: BoundsInterface | {} = {}): PositionInterface {

    // 限制父元素
    const boundsParent: HTMLElement = findElement(parent);

    if (!isDom(node) || !isDom(boundsParent) || !getBoundsInParent(node, boundsParent) || !isContains(boundsParent, node)) {
        return position;
    }

    const resultBounds = { ...getBoundsInParent(node, boundsParent), ...bounds };
    const { xStart, yStart, xEnd, yEnd } = resultBounds;
    let { x, y } = position;

    if (isNumber(xEnd)) x = Math.min(x, xEnd);
    if (isNumber(yEnd)) y = Math.min(y, yEnd);
    if (isNumber(xStart)) x = Math.max(x, xStart);
    if (isNumber(yStart)) y = Math.max(y, yStart);

    return { x, y };
}


