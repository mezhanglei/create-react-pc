import { arraySwap } from "@/utils/array";
import { FormFieldProps, SchemaData } from "../types";
import { formatPath, getCurrentPath, pathToArr } from "../../react-easy-formcore";

export const pathToArray = (pathStr?: string) => pathStr ? pathToArr(pathStr) : [];
// 根据路径更新数据
export const updateItemByPath = (properties: SchemaData['properties'], pathStr: string, data?: Partial<FormFieldProps>) => {
  const pathArr = pathToArray(pathStr);
  const end = pathArr.pop();
  const pathLen = pathArr?.length;
  let temp: any = properties;
  pathArr.forEach((item, index) => {
    const name = formatPath(item);
    if (index === 0) {
      temp = temp[name];
    } else {
      temp = temp?.properties?.[name];
    }
  });
  // 计算
  temp = pathLen === 0 ? temp : temp?.properties;
  if (end) {
    if (data === undefined) {
      if (temp instanceof Array) {
        const index = +end;
        temp?.splice(index, 1);
      } else {
        delete temp[end];
      }
    } else {
      const lastData = temp[end];
      temp[end] = { ...lastData, ...data };
    }
  }
  return properties;
};

// 设置指定路径的值
export const setItemByPath = (properties: SchemaData['properties'], pathStr: string, data?: Partial<FormFieldProps>) => {
  const pathArr = pathToArray(pathStr);
  const end = pathArr.pop();
  const pathLen = pathArr?.length;
  let temp: any = properties;
  pathArr.forEach((item, index) => {
    const name = formatPath(item);
    if (index === 0) {
      temp = temp[name];
    } else {
      temp = temp?.properties?.[name];
    }
  });
  // 计算
  temp = pathLen === 0 ? temp : temp?.properties;
  if (end) {
    if (data === undefined) {
      if (temp instanceof Array) {
        const index = +end;
        temp?.splice(index, 1);
      } else {
        delete temp[end];
      }
    } else {
      if (!temp[end] && temp instanceof Array) {
        const index = +end;
        temp.splice(index, 0, data)
      } else {
        temp[end] = data;
      }
    }
  }
  return properties;
};

// 根据path获取指定路径的项
export const getItemByPath = (properties: SchemaData['properties'], pathStr?: string) => {
  const pathArr = pathToArray(pathStr);
  let temp: any = properties;
  if (pathArr.length === 0) {
    return temp;
  }
  pathArr.forEach((item, index) => {
    const name = formatPath(item);
    if (index === 0) {
      temp = temp[name];
    } else {
      temp = temp?.properties?.[name];
    }
  });
  return temp;
};

// 根据index获取键值对
export const getKeyValueByIndex = (properties: SchemaData['properties'], index: number, parentPath?: string) => {
  const parent = getItemByPath(properties, parentPath);
  const childProperties = parentPath ? parent?.properties : parent;
  const childKeys = Object.keys(childProperties);
  const key = childKeys[index];
  const isList = childProperties instanceof Array;
  const name = isList ? `[${key}]` : key;
  return {
    name: name,
    field: childProperties[key]
  };
};

interface DataListType extends FormFieldProps {
  propertiesType?: 'object' | 'array';
  properties?: DataListType[];
}

// 将树中的选项转化为列表中的选项
export const treeItemToListItem = (name: string, field: FormFieldProps): DataListType => {
  const childs = field?.properties;
  const isList = childs instanceof Array;
  return {
    name: name,
    ...field,
    propertiesType: isList ? 'array' : 'object',
    properties: childs && treeToArr(childs)
  };
};

// 将树对象转化为
export const treeToArr = (properties: SchemaData['properties']) => {
  const temp = [];
  if (typeof properties === 'object') {
    for (let key in properties) {
      const field = properties[key];
      const isList = properties instanceof Array;
      const name = isList ? `[${key}]` : key;
      const item = treeItemToListItem(name, field);
      temp.push(item);
    }
  }
  return temp;
};

// 将嵌套数组还原成嵌套树对象
const arrayToTree = (dataList: DataListType[], isList?: boolean) => {
  const temp = isList ? [] : {};
  if (typeof dataList === 'object') {
    for (let key in dataList) {
      const current = dataList[key];
      const name = current?.name;
      delete current['name'];
      const formatName = typeof name === 'string' && formatPath(name);
      if (typeof formatName === 'string') {
        temp[formatName] = current;
        const properties = current?.properties;
        const childIsList = current?.propertiesType === 'array';
        if (properties) {
          temp[formatName].properties = arrayToTree(properties, childIsList)
        }
        delete current['propertiesType']
      }
    }
    return temp;
  }
};

// 添加新元素(有副作用，会改变传入的data数据)
export interface AddItem { name: string, field: FormFieldProps };
export const addItemByIndex = (properties: SchemaData['properties'], data: AddItem | AddItem[], index?: number, parentPath?: string) => {
  const parent = getItemByPath(properties, parentPath);
  const childProperties = parentPath ? parent?.properties : parent;
  const childList = treeToArr(childProperties);
  const dataList = data instanceof Array ? data : (data ? [data] : []);
  const fromList = dataList?.map?.((item) => treeItemToListItem(item?.name, item?.field));
  if (typeof index === 'number') {
    childList?.splice(index, 0, ...fromList);
  } else {
    childList?.push(...fromList);
  }
  const isList = childProperties instanceof Array;
  const result = arrayToTree(childList, isList);
  if (parentPath) {
    parent.properties = result;
    return properties;
  } else {
    return result;
  }
};

// 同级调换位置
export const swapSameLevel = (properties: SchemaData['properties'], from: { parentPath?: string, index: number }, to: { parentPath?: string, index?: number }) => {
  // 拖拽源
  const fromParentPath = from?.parentPath;
  const fromIndex = from?.index;
  // 拖放源
  const toParentPath = to?.parentPath;
  let toIndex = to?.index;
  // 同域排序
  if (fromParentPath === toParentPath) {
    let parent = getItemByPath(properties, fromParentPath);
    const childProperties = fromParentPath ? parent?.properties : parent;
    // 转成列表以便排序
    const childList = treeToArr(childProperties);
    toIndex = typeof toIndex === 'number' ? toIndex : childList?.length;
    const swapList = arraySwap(childList, fromIndex, toIndex);
    const isList = childProperties instanceof Array;
    const result = arrayToTree(swapList, isList);
    if (fromParentPath) {
      parent.properties = result;
      return properties;
    } else {
      return result;
    }
  }
};

// 跨级调换位置
export const swapDiffLevel = (properties: SchemaData['properties'], from: { parentPath?: string, index: number }, to: { parentPath?: string, index?: number }) => {
  // 拖拽源
  const fromParentPath = from?.parentPath;
  const fromIndex = from?.index;
  const fromParentPathArr = pathToArray(fromParentPath);
  const fromTreeItem = getKeyValueByIndex(properties, fromIndex, fromParentPath);
  const fromPath = getCurrentPath(fromTreeItem?.name, fromParentPath);
  // 拖放源
  const toParentPath = to?.parentPath;
  const toIndex = to?.index;
  const toParentPathArr = pathToArray(toParentPath);
  if (typeof fromPath !== 'string') return;
  // 先计算内部变动，再计算外部变动
  if (fromParentPathArr?.length > toParentPathArr?.length || !toParentPathArr?.length) {
    setItemByPath(properties, fromPath, undefined);
    const result = addItemByIndex(properties, fromTreeItem, toIndex, toParentPath);
    return result;
  } else {
    const result = addItemByIndex(properties, fromTreeItem, toIndex, toParentPath);
    result && setItemByPath(result, fromPath, undefined);
    return result;
  }
};
