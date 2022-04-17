import { klona } from 'klona';
import { nanoid } from 'nanoid';

export const indexToArray = (pathStr?: string) => pathStr ? `${pathStr}`.split('.').map(n => +n) : [];

export const uniqueId = () => {
  return nanoid(6);
};

export const setChildren = (treeData: any, data: any, pathStr?: string) => {
  const pathArr = indexToArray(pathStr);
  treeData = klona(treeData);
  let parent: any;
  pathArr.forEach((item, index) => {
    if (index == 0) {
      parent = treeData[item];
    } else {
      parent = parent.children[item];
    }
  });
  parent.children = data;
  return treeData;
};

// 添加新元素(有副作用，会改变传入的data数据)
export const addDragItem = (data: any[], dragItem: any, dropIndex?: number, groupPath?: string) => {
  const dropContainer = groupPath ? getItem(data, groupPath) : data;
  const item = dragItem instanceof Array ? { children: dragItem } : dragItem;
  // 插入
  if (typeof dropIndex === 'number') {
    dropContainer?.splice(dropIndex, 0, item);
    // 末尾添加
  } else {
    dropContainer?.push(item);
  }
  return data;
};

// 移除拖拽元素(有副作用, 会改变传入的data数据)
export const removeDragItem = (data: any[], dragIndex: number, groupPath?: string) => {
  const dragContainer = groupPath ? getItem(data, groupPath) : data;
  dragContainer?.splice(dragIndex, 1);
  return data;
};

// 根据路径获取指定路径的元素
export const getItem = (data: any[], path?: string) => {
  const pathArr = indexToArray(path);
  // 嵌套节点删除
  let temp: any;
  if (pathArr.length === 0) {
    return data;
  }
  pathArr.forEach((item, index) => {
    if (index === 0) {
      temp = data[item];
    } else {
      temp = temp?.children?.[item];
    }
  });
  if (temp.children) return temp.children;
  return temp;
};
