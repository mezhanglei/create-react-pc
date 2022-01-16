export function isDom(ele: any) {
    if (typeof HTMLElement === 'object') {
        return ele instanceof HTMLElement;
    } else {
        return ele && typeof ele === 'object' && ele.nodeType === 1 && typeof ele.nodeName === 'string';
    }
}

/**
 * 返回元素的视窗内的位置
 * @param el 
 * @returns 
 */
 export function getRect(el: HTMLElement) {
    return el.getBoundingClientRect()
}

/**
 * 返回事件对象相对于父元素的真实位置
 * @param el 事件对象
 * @param parent 父元素
 */
 export function getEventPosition(el: MouseEvent | TouchEvent, parent: HTMLElement = document.body || document.documentElement): null | {
    x: number;
    y: number;
} {
    let pos = null;
    if ("clientX" in el) {
        pos = {
            x: el?.clientX - getRect(parent).left,
            y: el?.clientY - getRect(parent).top,
        };
    } else if ("touches" in el) {
        if (el?.touches[0]) {
            pos = {
                x: el?.touches[0]?.clientX - getRect(parent).left,
                y: el?.touches[0]?.clientY - getRect(parent).top
            };
        }
    }

    return pos;
}

// 获取页面或元素的宽高 = 可视宽高 + 滚动条 + 边框
export function getOffsetWH(el: HTMLElement): undefined | {
    width: number;
    height: number;
} {
    if (!isDom(el)) {
        return;
    }
    if ([document.documentElement, document.body].includes(el)) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        return { width, height };
    } else {
        const width = el.offsetWidth;
        const height = el.offsetHeight;
        return { width, height };
    }
};

/**
 * 添加事件监听
 * @param el 目标元素
 * @param event 事件名称
 * @param handler 事件函数
 * @param inputOptions 配置
 */
 export function addEvent(el: any, event: string, handler: (...rest: any[]) => any, inputOptions?: {
    captrue?: boolean,
    once?: boolean,
    passive?: boolean
}): void {
    if (!el) return;
    // captrue: true事件捕获 once: true只调用一次,然后销毁 passive: true不调用preventDefault
    const options = { capture: false, once: false, passive: false, ...inputOptions };
    if (el.addEventListener) {
        el.addEventListener(event, handler, options);
    } else if (el.attachEvent) {
        el.attachEvent('on' + event, handler);
    } else {
        // $FlowIgnore: Doesn't think elements are indexable
        el['on' + event] = handler;
    }
}

/**
 * 移除事件监听
 * @param el 目标元素
 * @param event 事件名称
 * @param handler 事件函数
 * @param inputOptions 配置
 */
export function removeEvent(el: any, event: string, handler: (...rest: any[]) => any, inputOptions?: {
    captrue?: boolean,
    once?: boolean,
    passive?: boolean
}): void {
    if (!el) return;
    const options = { capture: false, once: false, passive: false, ...inputOptions };
    if (el.removeEventListener) {
        el.removeEventListener(event, handler, options);
    } else if (el.detachEvent) {
        el.detachEvent('on' + event, handler);
    } else {
        // $FlowIgnore: Doesn't think elements are indexable
        el['on' + event] = null;
    }
}