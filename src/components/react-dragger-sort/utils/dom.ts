
import { css, getClientXY, getRect } from "@/utils/dom";
import { CSSProperties } from "react";
import { EventType } from "./types";

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

// 判断事件对象在容器内处于前面还是后面
export const getEventDirction = (e: any, ele: HTMLElement) => {
  const eventXY = getClientXY(e);
  if (!eventXY) return;
  const rect = getRect(ele);
  const { x, y } = eventXY;
  const { left, top } = rect;
  const leftDistance = x - left;
  const topDistance = y - top;

  if (topDistance < 20 && leftDistance < 20) {
    return 'pre';
  } else {
    return 'next';
  }
};

// 触发动画
export function _animate(target: any, prevRect: any, transitionStyle?: CSSProperties) {
  const ms = 160;
  if (ms) {
    // 目标后面的位置
    const currentRect = target.getBoundingClientRect()
    if (prevRect.nodeType === 1) {
      prevRect = prevRect.getBoundingClientRect()
    }

    // 目标初始化位置为之前位置
    css(target, {
      transition: 'none',
      'transform': `translate3d(${prevRect.left - currentRect.left}px, ${prevRect.top - currentRect.top}px,0)`
    });

    // dom的宽高位置属性会回流重绘目前的布局样式
    target.offsetWidth;

    // 目标重回现在的位置
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
