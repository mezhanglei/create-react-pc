import { isDom, isEmpty, isNumber } from "@/utils/type";
import { isContains, findElement } from "@/utils/dom";

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
// 接收偏移位置，返回新的transform值
export function getTranslation(current: { x?: number, y?: number }, positionOffset: { x: number, y: number } | undefined, unit: string) {
  const { x, y } = current;
  let translation;
  if (typeof x == 'number' || typeof y == 'number') {
    translation = `translate3d(${x || 0}${unit},${y || 0}${unit}, 0)`;
  }

  if (positionOffset) {
    const offsetX = `${(typeof positionOffset.x === 'string') ? positionOffset.x : positionOffset.x + unit}`;
    const offsetY = `${(typeof positionOffset.y === 'string') ? positionOffset.y : positionOffset.y + unit}`;
    translation = `translate3d(${offsetX},${offsetY}, 0)`; + translation;
  }
  return translation;
}

// 返回目标元素被父元素限制的位置范围
export function getBoundsInParent(node: HTMLElement, bounds: any) {
  // 限制父元素
  const boundsParent = (findElement(bounds) || findElement(bounds?.element)) as HTMLElement;

  if (!isDom(node) || !isDom(boundsParent)) {
    return;
  }
  if (!isContains(boundsParent, node)) {
    throw new Error("`parent` is not parentNode of the child");
  }

  // 元素外部大小
  const nodeOutWidth = node.offsetWidth;
  const nodeOutHeight = node.offsetHeight;
  // 容器大小
  const parentInnerWidth = boundsParent.clientWidth;
  const parentInnerHeight = boundsParent.clientHeight;

  // 大小差距
  const xDiff = parentInnerWidth - nodeOutWidth > 0 ? parentInnerWidth - nodeOutWidth : 0;
  const yDiff = parentInnerHeight - nodeOutHeight > 0 ? parentInnerHeight - nodeOutHeight : 0;

  // 当限制为元素选择器或元素时，位置限制该元素内部
  if (findElement(bounds)) {
    return {
      minX: 0,
      maxX: xDiff + 0,
      minY: 0,
      maxY: yDiff + 0
    };
    // 当限制为某个元素内的某个范围，则计算该范围内的限制位置
  } else {
    return {
      minX: Math.max(0, bounds?.left || 0),
      maxX: Math.min(xDiff, xDiff - (bounds?.right || 0)),
      minY: Math.max(0, bounds?.top || 0),
      maxY: Math.min(yDiff, yDiff - (bounds?.bottom || 0))
    };
  }
}

// 元素在父元素限制范围下的可视位置
export function getPositionByBounds(node: HTMLElement, position: PositionInterface, bounds: any): PositionInterface {

  if (isEmpty(bounds)) return position;

  let resultBounds = getBoundsInParent(node, bounds);
  if (!resultBounds) return position;
  const { minX, minY, maxX, maxY } = resultBounds;
  let { x, y } = position;
  if (isNumber(maxX)) x = Math.min(x, maxX);
  if (isNumber(maxY)) y = Math.min(y, maxY);
  if (isNumber(minX)) x = Math.max(x, minX);
  if (isNumber(minY)) y = Math.max(y, minY);

  return { x, y };
}

/**
 * 返回元素的视窗内的位置
 * @param el 
 * @returns 
 */
export function getRect(el: HTMLElement) {
  return el.getBoundingClientRect();
}

/**
 * 查询元素是否在某个元素内
 * @param el 元素
 * @param parent 父元素
 */
export function matchParent(el: any, parent: HTMLElement): boolean {
  let node = el;
  do {
    if (node === parent) return true;
    if ([document.documentElement, document.body].includes(node)) return false;
    node = node.parentNode;
  } while (node);

  return false;
}

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


