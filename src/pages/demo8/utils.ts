import { klona } from 'klona';
import { nanoid } from 'nanoid';

export const indexToArray = (pathStr?: string) => pathStr ? `${pathStr}`.split('.').map(n => +n) : [];

export const uniqueId = () => {
  return nanoid(6);
};

// 克隆目标路径对应的数据
export const getCloneItem = (data: any, path?: string) => {
  const pathArr = indexToArray(path);
  let result = {};
  pathArr.forEach(n => {
    result = data[n];
    data = result.children;
  });
  return klona(result);
};

// 根据下标获取目标路径对应的值
export const getItem = (data: any, path?: string) => {
  const pathArr = indexToArray(path);
  const cloneData = klona(data);
  // 嵌套节点删除
  let parent: any;
  if (pathArr.length === 0) {
    return cloneData;
  }
  pathArr.forEach((item, index) => {
    if (index === 0) {
      parent = cloneData[item];
    } else {
      parent = parent?.children?.[item];
    }
  });
  if (parent.children) return parent.children;
  return parent;
};

// 获取父级的数据
export const getParent = (data: any, path?: string) => {
  const pathArr = indexToArray(path);
  // 嵌套节点删除
  let parent: any;
  pathArr?.pop();
  if (pathArr?.length === 0) {
    return data;
  }
  pathArr.forEach((item, index) => {
    if (index === 0) {
      parent = data[item];
    } else {
      parent = parent?.children?.[item];
    }
  });
  if (parent.children) return parent.children;
  return parent;
};

// 删除目标路径上的数据
export const itemRemove = (data: any, path?: string) => {
  let parent = getParent(data, path);
  let pathArr = indexToArray(path);
  let targetIndex = pathArr.pop();
  if (parent?.children) {
    parent.children.splice(targetIndex, 1);
    return data;
  }
  parent?.splice(targetIndex, 1);
  return data;
};

// 给目标路径上的添加数据
export const itemAdd = (data: any, item: any, path?: string) => {
  let parent = getParent(data, path);
  let pathArr = indexToArray(path);
  let targetIndex = pathArr.pop();
  if (parent?.children) {
    parent.children.splice(targetIndex, 0, item);
    return data;
  }
  parent?.splice(targetIndex, 0, item);
  return data;
};

// 设置children属性
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

// 是否为路径
export const isPath = (pathIndex?: string) => {
  let result = true;
  indexToArray(pathIndex).forEach(item => {
    if (isNaN(item)) {
      result = false;
      return false;
    }
  });

  return result;
};

// 判断hover的路径是否为自己的子元素
export const isChildrenPath = (dragIndex: string, hoverIndex: string) => {
  let dragIndexArr = String(dragIndex).split('.');
  let hoverIndexArr = String(hoverIndex).split('.');

  if (hoverIndexArr > dragIndexArr) {
    let sliceArr = hoverIndexArr.slice(0, dragIndexArr.length);
    if (sliceArr.join('.') === dragIndexArr.join('.')) {
      return true;
    }
  }
  return false;
};

// 根据数组路径 生成所有父级别的路径
export const generatePathArr = (path: string) => {
  let pathArr: string[] = [];
  let indexArr = String(path).split('.');
  let data = Array.from(indexArr);

  indexArr.forEach((item, i) => {
    data.pop();
    pathArr.push(Array.from(data).join('.'));
  });
  pathArr.pop();
  return pathArr;
};
