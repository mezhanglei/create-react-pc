import { css, getRect } from "@/utils/dom";

// 选择器是否匹配
export function matches(el: any, selector: string) {
  if (!selector) return;

  selector[0] === '>' && (selector = selector.substring(1));

  if (el) {
    try {
      if (el.matches) {
        return el.matches(selector);
      } else if (el.msMatchesSelector) {
        return el.msMatchesSelector(selector);
      } else if (el.webkitMatchesSelector) {
        return el.webkitMatchesSelector(selector);
      }
    } catch (_) {
      return false;
    }
  }

  return false;
}

// 根据选择器返回在父元素内的序号(去除克隆出来后的元素)
export function getIndex(el: HTMLElement, excluded?: HTMLElement, selector?: string) {
  const children = el?.parentNode?.children;
  if (!children) return;
  let index = 0;
  for (let i = 0; i < children?.length; i++) {
    const node = children[i] as HTMLElement;
    if ((!selector || matches(node, selector)) && node !== excluded) {
      // 如果等于就结束循环
      if (el !== node) {
        index++
      } else {
        break;
      }
    }
  }
  return index;
}