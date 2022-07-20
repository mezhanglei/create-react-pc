import { SchemaData } from '@/components/react-easy-formrender';
import { getItemByPath, pathToArray } from '@/components/react-easy-formrender/utils/utils';
import { nanoid } from 'nanoid';

export const defaultGetId = (name: string) => {
  return `${name}_${nanoid(6)}`;
};

// 根据路径返回父元素路径
export const getParent = (path: string) => {
  const pathArr = pathToArray(path);
  const end = pathArr?.pop();
  if (pathArr?.length && typeof end === 'string') {
    const index = path?.lastIndexOf(end);
    const parentPath = path.substring(0, index - 1);
    return parentPath;
  }
}

// 根据路径判断当前是否为数组项
export const isSelecteList = (path: string) => {
  const pathArr = pathToArray(path);
  const end = pathArr?.pop();
  if (typeof end === 'string') {
    const index = path?.lastIndexOf(`[${end}]`);
    return index === path?.length - (end?.length + 2);
  }
}

// 根据路径返回在父元素中的当前位置, 没有则返回-1;
export const getSelectedIndex = (path: string, properties?: SchemaData['properties']) => {
  const parentPath = getParent(path);
  const pathArr = pathToArray(path);
  const end = pathArr?.pop();
  const parent = getItemByPath(properties, parentPath);
  const keys = Object.keys(parent || {});
  const index = end ? keys?.lastIndexOf(end) : -1;
  return index;
}
