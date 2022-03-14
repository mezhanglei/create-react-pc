import { klona } from 'klona';
import { nanoid } from 'nanoid';

export const indexToArray = (pathStr: string) => `${pathStr}`.split('.').map(n => +n);

export const uniqueId = () => {
  return nanoid(6);
};

// 克隆目标路径对应的数据
export const getCloneItem = (path: string, data: any) => {
  const arr = indexToArray(path);
  let result = {};
  arr.forEach(n => {
    result = data[n];
    data = result.children;
  });
  return klona(result);
};

// 根据下标获取目标路径对应的值
export const getItem = (path: string, data: any) => {
  const arr = indexToArray(path);
  // 嵌套节点删除
  let parent: any;
  if (arr.length === 0) {
    return data;
  }
  arr.forEach((item, index) => {
    if (index === 0) {
      parent = data[item];
    } else {
      parent = parent?.children?.[item];
    }
  });
  if (parent.children) return parent.children;
  return parent;
};

export const getParent = (path: string, data: any) => {
  const arr = indexToArray(path);
  // 嵌套节点删除
  let parent: any;
  arr.pop();
  if (arr.length === 0) {
    return data;
  }
  arr.forEach((item, index) => {
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
export const itemRemove = (path: string, data: any) => {
  let parent = getParent(path, data);
  let arr = indexToArray(path);
  let targetIndex = arr.pop();
  if (parent?.children) {
    parent.children.splice(targetIndex, 1);
    return data;
  }
  parent?.splice(targetIndex, 1);
  return data;
};

// 给目标路径上的添加数据
export const itemAdd = (path: string, data: any, item: any) => {
  let parent = getParent(path, data);
  let arr = indexToArray(path);
  let targetIndex = arr.pop();
  if (parent?.children) {
    parent.children.splice(targetIndex, 0, item);
    return data;
  }
  parent?.splice(targetIndex, 0, item);
  return data;
};

// 给指定路径设置值并返回结果
export const setPathData = (pathStr: string, treeData: any, data: any) => {
  const arr = indexToArray(pathStr);
  treeData = klona(treeData);
  let parent: any;
  arr.forEach((item, index) => {
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
export const isPath = (pathIndex: string) => {
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
  let arr: string[] = [];
  let indexArr = String(path).split('.');
  let data = Array.from(indexArr);

  indexArr.forEach((item, i) => {
    data.pop();
    arr.push(Array.from(data).join('.'));
  });
  arr.pop();
  return arr;
};
