import { css } from "@/utils/dom";

// 触发动画
export function _animate(target: any, prevRect: any) {
  const ms = 160
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
      'transform': 'translate3d(0,0,0)'
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