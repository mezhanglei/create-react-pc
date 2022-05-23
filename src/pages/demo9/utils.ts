import { nanoid } from 'nanoid';

export const indexToArray = (pathStr?: string) => pathStr ? `${pathStr}`.split('.').map(n => +n) : [];

export const uniqueId = () => {
  return nanoid(6);
};

// 添加新元素(有副作用，会改变传入的data数据)
export const addDragItem = (data: any[], dragItem: any, dropIndex?: number, groupPath?: string) => {
  const parent = getItem(data, groupPath);
  const childs = groupPath ? parent?.children : data;
  const item = dragItem instanceof Array ? { children: dragItem } : dragItem;
  // 插入
  if (typeof dropIndex === 'number') {
    childs?.splice(dropIndex, 0, item);
    // 末尾添加
  } else {
    childs?.push(item);
  }
  return data;
};

// 移除拖拽元素(有副作用, 会改变传入的data数据)
export const removeDragItem = (data: any[], dragIndex: number, groupPath?: string) => {
  const parent = getItem(data, groupPath);
  const childs = groupPath ? parent?.children : data;
  childs?.splice(dragIndex, 1);
  return data;
};

// 根据路径获取指定路径的元素
export const getItem = (data: any[], path?: string) => {
  const pathArr = indexToArray(path);
  // 嵌套节点删除
  let temp: any = data;
  if (pathArr.length === 0) {
    return temp;
  }
  pathArr.forEach((item, index) => {
    if (index === 0) {
      temp = temp[item];
    } else {
      temp = temp?.children?.[item];
    }
  });
  return temp;
};
