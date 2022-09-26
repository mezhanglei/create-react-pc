import { getCurrentPath } from '@/components/react-easy-formcore';
import { SchemaData } from '@/components/react-easy-formrender';
import { getItemByPath, pathToArray } from '@/components/react-easy-formrender/utils/utils';
import { nanoid } from 'nanoid';

export const defaultGetId = (name: string) => {
  return `${name}_${nanoid(6)}`;
};

// 根据路径返回父元素路径(兼容a[0],a.[0],a.b, a[0].b形式的路径)
export const getParent = (path: string) => {
  const pathArr = pathToArray(path);
  const end = pathArr?.pop();
  if (pathArr?.length && typeof end === 'string') {
    const index = path?.lastIndexOf(end);
    const parentPath = path.substring(0, index);
    return parentPath?.replace(/\[$/g, '')?.replace(/\.$/g, '');
  }
}

// 路径末尾项是否为数组项
export const endIsListItem = (path: string) => {
  const pathArr = pathToArray(path);
  const end = pathArr?.pop();
  if (typeof end === 'string') {
    const listItem = `[${end}]`;
    const index = path?.lastIndexOf(listItem);
    return index === path?.length - listItem?.length;
  }
}

// 更改path的末尾项
export const changeSelected = (oldPath: string, newName: string) => {
  if (newName && oldPath) {
    const parent = getParent(oldPath);
    const newPath = getCurrentPath(newName, parent);
    return newPath;
  }
}

// 获取末尾节点
export const getPathEnd = (path: string) => {
  let parent = getParent(path);
  parent = parent?.replace('[', '\\[')?.replace(']', '\\]');
  const reg = parent ? new RegExp(`${parent}(\\S*)`) : new RegExp(`(\\S*)`);
  const end = path.match(reg)?.[1];
  return end?.replace(/^\./, '');
}

// 根据路径返回在父元素中的当前位置, 没有则返回-1;
export const getSelectedIndex = (path: string, properties?: SchemaData['properties']) => {
  const parentPath = getParent(path);
  const pathArr = pathToArray(path);
  const end = pathArr?.pop();
  const parent = getItemByPath(properties, parentPath);
  const childProperties = parentPath ? parent?.properties : properties;
  const keys = Object.keys(childProperties || {});
  const index = end ? keys?.indexOf(end) : -1;
  return index;
}
