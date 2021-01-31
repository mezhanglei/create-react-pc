import { getPrefixStyle } from "@/utils/cssPrefix";


// 添加选中类和样式
export function addUserSelectStyles(doc: any) {
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
}

// 移除选中样式和选中区域
export function removeUserSelectStyles(doc: any) {
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
export function addClassName(el: HTMLElement, className: string) {
    if (el.classList) {
        el.classList.add(className);
    } else {
        if (!el.className.match(new RegExp(`(?:^|\\s)${className}(?!\\S)`))) {
            el.className += ` ${className}`;
        }
    }
}

// 移除类名
export function removeClassName(el: HTMLElement, className: string) {
    if (el.classList) {
        el.classList.remove(className);
    } else {
        el.className = el.className.replace(new RegExp(`(?:^|\\s)${className}(?!\\S)`, 'g'), '');
    }
}

// 输入值，返回0或该值
export function snapToGrid(grid: [number, number], pendingX: number, pendingY: number) {
    const x = Math.round(pendingX / grid[0]) * grid[0];
    const y = Math.round(pendingY / grid[1]) * grid[1];
    return [x, y];
}
