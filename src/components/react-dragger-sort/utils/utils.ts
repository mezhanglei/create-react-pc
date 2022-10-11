import { matches } from "@/utils/dom";
import { DndParams, DndProps, DragItem } from "./types";

export const isChildDrag = (item: DragItem, options: DndProps['options']) => {
  const childDrag = options?.childDrag;
  const dragNode = item?.node;
  if (typeof childDrag == 'boolean') {
    return childDrag;
  } if (typeof childDrag === 'function') {
    return childDrag(item, options);
  } else if (childDrag instanceof Array) {
    return childDrag?.some((child) => typeof child === 'string' ? matches(dragNode, child) : dragNode === child);
  }
}

export const isChildOut = (params: DndParams, options: DndProps['options']) => {
  const childOut = options?.childOut;
  const dragNode = params?.from?.node;
  if (typeof childOut == 'boolean') {
    return childOut;
  } if (typeof childOut === 'function') {
    return childOut(params, options);
  } else if (childOut instanceof Array) {
    return childOut?.some((child) => typeof child === 'string' ? matches(dragNode, child) : dragNode === child);
  }
}

export const isCanSort = (params: DndParams, options: DndProps['options']) => {
  const childSort = options?.allowSort;
  if (typeof childSort == 'boolean') {
    return childSort;
  } if (typeof childSort === 'function') {
    return childSort(params, options);
  }
}

export const isCanDrop = (params: DndParams, options: DndProps['options']) => {
  const childDrop = options?.allowDrop;
  if (typeof childDrop == 'boolean') {
    return childDrop;
  } if (typeof childDrop === 'function') {
    return childDrop(params, options);
  }
}
