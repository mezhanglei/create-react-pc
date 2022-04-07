
import { css } from "@/utils/dom";
export interface BoundingRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}
// 事件对象是否在目标范围内
export const isMoveIn = (event: { x: number, y: number }, other: BoundingRect) => {

  const eventX = event?.x;
  const eventY = event?.y;

  return !(eventX - other?.left < 0 || eventY - other?.top < 0 || eventX - other?.right > 0 || eventY - other?.bottom > 0)
};

// 点距离目标内的四条边的最短距离
export function getMinDistance(event: { x: number, y: number }, other: BoundingRect) {
  const distances = [Math.floor(event.x - other.left), Math.floor(event.y - other?.top), Math.floor(other?.bottom - event?.y), Math.floor(other?.right - event.x)];
  const minDistance = Math.min.apply(Math, distances);
  return minDistance;
};


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
