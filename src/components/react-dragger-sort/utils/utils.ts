import { matches } from "@/utils/dom";
import { DndParams, DndProps, DragItem } from "./types";

// 判断字符是否是数组中的选项
export const isListItem = (item: string) => (/\[(.{1}?)\]/gi.test(item));

// 拼接当前项的path
export const getCurrentPath = (name: string, parent?: string) => {
  if (isListItem(name)) {
    return parent ? `${parent}${name}` : name;
  } else {
    return parent ? `${parent}.${name}` : name;
  }
};

export const isChildDrag = (item: DragItem, options: DndProps['options']) => {
  const childDrag = options?.childDrag;
  const dragNode = item?.item;
  if (typeof childDrag == 'boolean') {
    return childDrag;
  } if (typeof childDrag === 'function') {
    return childDrag(item, options);
  } else if (childDrag instanceof Array) {
    return childDrag?.some((item) => typeof item === 'string' ? matches(dragNode, item) : dragNode === item);
  }
}

export const isChildOut = (params: DndParams, options: DndProps['options']) => {
  const childOut = options?.childOut;
  const dragNode = params?.from?.item;
  if (typeof childOut == 'boolean') {
    return childOut;
  } if (typeof childOut === 'function') {
    return childOut(params, options);
  } else if (childOut instanceof Array) {
    return childOut?.some((item) => typeof item === 'string' ? matches(dragNode, item) : dragNode === item);
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
