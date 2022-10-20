import { arraySwap } from "@/utils/array";
import { FormFieldProps, SchemaData } from "../types";
import { formatName, getCurrentPath, pathToArr, deepSet } from "../../react-easy-formcore";
import { deepClone } from "@/utils/object";

export const pathToArray = (pathStr?: string) => pathStr ? pathToArr(pathStr) : [];
// 根据路径更新数据
export const updateItemByPath = (properties: SchemaData['properties'], pathStr: string, data?: Partial<FormFieldProps>) => {
  const pathArr = pathToArray(pathStr);
  const end = pathArr.pop();
  const pathLen = pathArr?.length;
  let temp: any = properties;
  pathArr.forEach((item, index) => {
    const name = formatName(item);
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
    const name = formatName(item);
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
    const name = formatName(item);
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

// 将树中的选项转化为列表中的选项
export const treeItemToListItem = (name: string, field: FormFieldProps) => {
  return {
    name: name,
    ...field
  };
};

// 转化为有序数组列表
export const toList = (properties: SchemaData['properties']) => {
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

// 从有序列表中还原源数据
const restoreFromList = (dataList: FormFieldProps[], isList?: boolean) => {
  const temp = isList ? [] : {};
  if (typeof dataList === 'object') {
    for (let key in dataList) {
      const current = dataList[key];
      const name = current?.name;
      delete current['name'];
      const format = typeof name === 'string' && formatName(name);
      if (typeof format === 'string') {
        temp[format] = current;
        const properties = current?.properties;
        if (properties) {
          temp[format].properties = properties;
        }
      }
    }
    return temp;
  }
};

// 更新指定路径的name
export const updateName = (properties: SchemaData['properties'], pathStr: string, newName?: string) => {
  if (typeof newName !== 'string' || !pathStr) return properties;
  const pathArr = pathToArray(pathStr);
  const end = pathArr.pop();
  if (end === formatName(newName)) return properties;
  const parentPath = pathArr?.join('.');
  const parent = getItemByPath(properties, parentPath);
  const childProperties = parentPath ? parent?.properties : parent;
  const childList = toList(childProperties);
  childList?.map((item) => {
    if (item?.name) {
      const format = formatName(item?.name);
      if (format === end) {
        item.name = newName;
      }
    }
  });
  const isList = childProperties instanceof Array;
  const result = restoreFromList(childList, isList);
  if (parentPath) {
    parent.properties = result;
    return properties;
  } else {
    return result;
  }
}

// 添加新元素(有副作用，会改变传入的data数据)
export interface AddItem { name: string, field: FormFieldProps };
export const addItemByIndex = (properties: SchemaData['properties'], data: AddItem | AddItem[], index?: number, parentPath?: string) => {
  const parent = getItemByPath(properties, parentPath);
  const childProperties = parentPath ? parent?.properties : parent;
  const childList = toList(childProperties);
  const dataList = data instanceof Array ? data : (data ? [data] : []);
  const fromList = dataList?.map?.((item) => treeItemToListItem(item?.name, item?.field));
  if (typeof index === 'number') {
    childList?.splice(index, 0, ...fromList);
  } else {
    childList?.push(...fromList);
  }
  const isList = childProperties instanceof Array;
  const result = restoreFromList(childList, isList);
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
    const childList = toList(childProperties);
    toIndex = typeof toIndex === 'number' ? toIndex : childList?.length;
    const swapList = arraySwap(childList, fromIndex, toIndex);
    const isList = childProperties instanceof Array;
    const result = restoreFromList(swapList, isList);
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
  if (typeof fromPath !== 'string') return properties;
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

// 提取properties中的默认值
export const getInitialValues = (properties: SchemaData['properties']) => {
  let initialValues = {};
  // 遍历处理对象树中的非properties字段
  const deepHandle = (formField: FormFieldProps, path: string) => {
    for (const propsKey in formField) {
      if (propsKey !== 'properties') {
        const propsValue = formField[propsKey]
        if (propsKey === 'initialValue' && propsValue !== undefined) {
          initialValues = deepSet(initialValues, path, propsValue);
        }
      } else {
        const children = formField[propsKey]
        for (const childKey in children) {
          const childField = children[childKey];
          const childName = children instanceof Array ? `[${childKey}]` : childKey;
          if (childName) {
            const childPath = getCurrentPath(childName, path) as string;
            deepHandle(childField, childPath);
          }
        }
      }
    }
  };

  for (const key in properties) {
    const formField = properties[key];
    const name = properties instanceof Array ? `[${key}]` : key;
    if (name) {
      deepHandle(formField, name);
    }
  }
  return initialValues;
}

// 深度合并两个
export const mergeProperties = function (obj1: SchemaData['properties'], obj2: SchemaData['properties']) {
  let cloneObj1 = deepClone(obj1)
  for (let key in obj2) {
    if (cloneObj1) {
      cloneObj1[key] = obj2[key]
    } else {
      cloneObj1 = obj2
    }
  }
  return cloneObj1;
};
