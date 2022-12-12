import { matches } from "@/utils/dom";
import { DndParams, DropEffect } from "./types";

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
  // 只有dragStart事件里面设置effectAllowed
  if (!e.dataTransfer) return;
  if (type === 'dragstart') {
    e.dataTransfer.effectAllowed = val;
  } else {
    // 只有dragOver事件里面设置dropEffect
    e.preventDefault();
    e.dataTransfer.dropEffect = val;
  }
}
