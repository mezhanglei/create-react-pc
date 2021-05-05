import { DIRECTION } from "./types";
import { getPrefixStyle } from "@/utils/cssPrefix";

export const scrollProp = {
    [DIRECTION.VERTICAL]: 'scrollTop',
    [DIRECTION.HORIZONTAL]: 'scrollLeft',
};

export const sizeProp = {
    [DIRECTION.VERTICAL]: 'height',
    [DIRECTION.HORIZONTAL]: 'width',
};

export const clientWH = {
    [DIRECTION.VERTICAL]: 'clientHeight',
    [DIRECTION.HORIZONTAL]: 'clientWidth',
};

export const positionProp = {
    [DIRECTION.VERTICAL]: 'top',
    [DIRECTION.HORIZONTAL]: 'left',
};

export const marginProp = {
    [DIRECTION.VERTICAL]: 'marginTop',
    [DIRECTION.HORIZONTAL]: 'marginLeft',
};

export const oppositeMarginProp = {
    [DIRECTION.VERTICAL]: 'marginBottom',
    [DIRECTION.HORIZONTAL]: 'marginRight',
};

export const STYLE_WRAPPER = {
    overflow: 'auto',
    willChange: 'transform', // 告知浏览器该元素会有哪些变化的方法,提前做好对应的优化准备工作, 但会消耗内存
};

export const STYLE_INNER = {
    [getPrefixStyle("position")]: 'relative',
    width: '100%',
    minHeight: '100%',
};

export const STYLE_ITEM = {
    [getPrefixStyle("position")]: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
};
