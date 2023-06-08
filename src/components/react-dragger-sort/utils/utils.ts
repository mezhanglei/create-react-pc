import { matches, css, getClientXY, getRect } from "@/utils/dom";
import { CSSProperties } from "react";
import { DndParams, DropEffect, EventType } from "../types";

export const isDisabledDrag = (params: DndParams) => {
  const { from } = params;
  const fromOptions = from?.group?.options;
  const childDisabled = fromOptions?.disabledDrag;
  const dragNode = from?.node;
  if (typeof childDisabled == 'boolean') {
    return childDisabled;
  } if (typeof childDisabled === 'function') {
    return childDisabled(params);
  } else if (childDisabled instanceof Array) {
    return childDisabled?.some((child) => typeof child === 'string' ? matches(dragNode, child) : dragNode === child);
  }
}

export const isHiddenFrom = (params: DndParams) => {
  const { from } = params;
  const fromOptions = from?.group?.options;
  const hiddenFrom = fromOptions?.hiddenFrom;
  const dragNode = from?.node;
  if (typeof hiddenFrom == 'boolean') {
    return hiddenFrom;
  } if (typeof hiddenFrom === 'function') {
    return hiddenFrom(params);
  } else if (hiddenFrom instanceof Array) {
    return hiddenFrom?.some((child) => typeof child === 'string' ? matches(dragNode, child) : dragNode === child);
  }
}

export const isDisabledSort = (params: DndParams) => {
  const { to } = params;
  const toOptions = to?.group?.options;
  const disabledSort = toOptions?.disabledSort;
  const toNode = to?.node;
  if (typeof disabledSort == 'boolean') {
    return disabledSort;
  } if (typeof disabledSort === 'function') {
    return disabledSort(params);
  } else if (disabledSort instanceof Array) {
    return disabledSort?.some((child) => typeof child === 'string' ? matches(toNode, child) : toNode === child);
  }
}

export const isDisabledDrop = (params: DndParams) => {
  const { to } = params;
  const toOptions = to?.group?.options;
  const disabledDrop = toOptions?.disabledDrop;
  if (typeof disabledDrop == 'boolean') {
    return disabledDrop;
  } if (typeof disabledDrop === 'function') {
    return disabledDrop(params);
  }
}

// 设置拖拽时焦点样式
export const setMouseEvent = (e: any, type: 'dragstart' | 'dragover', val?: DropEffect) => {
  if (!e.dataTransfer) return;
  // 只有dragStart事件里面设置effectAllowed
  if (type === 'dragstart') {
    e.dataTransfer.effectAllowed = val;
  } else {
    // 只有dragOver事件里面设置dropEffect
    e.preventDefault();
    e.dataTransfer.dropEffect = val;
  }
}

// 事件是否在目标内部
export const isMoveIn = (e: EventType, target: HTMLElement) => {
  const eventXY = getClientXY(e);
  const rect = getRect(target);
  if (eventXY && rect) {
    const { x, y } = eventXY;
    const { left, top, right, bottom } = rect;
    return !(x - left < 0 || y - top < 0 || x - right > 0 || y - bottom > 0);
  }
};

// 触发动画
export function _animate(target: HTMLElement & { animated?: any }, prevRect: any, transitionStyle?: CSSProperties) {
  const ms = 160;
  if (ms) {
    // 目标后面的位置
    const currentRect = target.getBoundingClientRect()
    if (prevRect.nodeType === 1) {
      prevRect = prevRect.getBoundingClientRect()
    }

    // 先回到动画起始位置
    css(target, {
      transition: 'none',
      'transform': `translate3d(${prevRect.left - currentRect.left}px, ${prevRect.top - currentRect.top}px,0)`
    });

    // 然后通过重绘展示已经在起始位置
    target.offsetWidth;

    // 确认执行动画
    css(target, {
      'transition': `all ${ms}ms`,
      'transform': 'translate3d(0,0,0)',
      ...transitionStyle
    });

    clearTimeout(target.animated);
    // 时间到了之后清空重置
    target.animated = setTimeout(function () {
      css(target, {
        transition: '',
        transform: ''
      });
      target.animated = false;
    }, ms);
  }
}

// 收集dom，返回可以执行动画的函数
export function createAnimate(doms?: HTMLCollection | HTMLElement[]) {
  const collect: { dom: HTMLElement, rect: DOMRect }[] = [];
  if (doms) {
    for (let i = 0; i < doms?.length; i++) {
      const dom = doms[i] as HTMLElement;
      collect.push({
        dom,
        rect: dom?.getBoundingClientRect()
      })
    }
  }
  return () => {
    for (let i = 0; i < collect?.length; i++) {
      const item = collect[i];
      if (item) {
        _animate(item.dom, item.rect);
      }
    }
  }
}
