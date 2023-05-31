import { arrayMove } from "@/utils/array";
import { FieldUnionType, FormComponent, FormFieldProps, PropertiesData } from "../types";
import { pathToArr, deepSet, joinFormPath, deepGet } from "../../react-easy-formcore";
import { isEmpty } from "@/utils/type";
import { isReactComponent, isValidChildren } from "@/utils/ReactIs";
import React from "react";

// 匹配字符串表达式
export const matchExpression = (value?: any) => {
  if (typeof value === 'string') {
    const reg = new RegExp('\{\{\s*.*?\s*\}\}', 'g');
    const result = value?.match(reg)?.[0];
    return result;
  }
}

// 获取路径的末尾节点字符串(不带中括号)
export const getPathEnd = (path?: string) => {
  const pathArr = pathToArr(path)
  const end = pathArr?.pop()
  return end;
}

// 根据路径返回父路径(兼容a[0],a.[0],a.b, a[0].b形式的路径)
export const getParent = (path?: string) => {
  const end = getPathEnd(path);
  if (typeof end === 'string' && path) {
    const endReg = new RegExp(`\\[\\d+\\]$|\\.${end}$|${end}$`)
    return path.replace(endReg, '')
  }
}

// 路径末尾项是否为数组项
export const endIsListItem = (path?: string) => {
  if (typeof path === 'string') {
    const endReg = new RegExp('\\[\\d+\\]$');
    return endReg.test(path)
  }
}

// 更改当前的表单字段
export const changePathEnd = (oldPath: string, endName: string | number) => {
  if (!isEmpty(endName) && oldPath) {
    const parent = getParent(oldPath);
    const newPath = joinFormPath(parent, endName);
    return newPath;
  }
}

// 根据路径更新数据
export const updateItemByPath = (properties: PropertiesData, data?: any, path?: string, attributeName?: string) => {
  const pathArr = pathToArr(path);
  const end = pathArr.pop();
  const pathLen = pathArr?.length;
  let temp: any = properties;
  pathArr.forEach((item, index) => {
    const name = item;
    if (index === 0) {
      temp = temp[name];
    } else {
      temp = temp?.properties?.[name];
    }
  });
  // 计算
  temp = pathLen === 0 ? temp : temp?.properties;
  if (end) {
    const lastData = temp[end];
    if (attributeName) {
      const newData = deepSet(lastData, attributeName, data);
      temp[end] = newData;
    } else {
      if (data === undefined) {
        if (temp instanceof Array) {
          const index = +end;
          temp?.splice(index, 1);
        } else {
          delete temp[end];
        }
      } else {
        temp[end] = { ...lastData, ...data };
      }
    }
  }
  return properties;
};

// 设置指定路径的值
export const setItemByPath = (properties: PropertiesData, data?: any, path?: string, attributeName?: string) => {
  const pathArr = pathToArr(path);
  const end = pathArr.pop();
  const pathLen = pathArr?.length;
  let temp: any = properties;
  pathArr.forEach((item, index) => {
    const name = item;
    if (index === 0) {
      temp = temp[name];
    } else {
      temp = temp?.properties?.[name];
    }
  });
  // 计算
  temp = pathLen === 0 ? temp : temp?.properties;
  if (end) {
    if (attributeName) {
      const lastData = temp[end];
      const newData = deepSet(lastData, attributeName, data);
      temp[end] = newData;
    } else {
      if (data === undefined) {
        if (temp instanceof Array) {
          const index = +end;
          temp?.splice(index, 1);
        } else {
          delete temp[end];
        }
      } else {
        if (temp instanceof Array && temp[end] === undefined) {
          const index = +end;
          temp.splice(index, 0, data)
        } else {
          temp[end] = data;
        }
      }
    }
  }
  return properties;
};

// 根据path获取指定路径的项
export const getItemByPath = (properties?: PropertiesData, path?: string, attributeName?: string) => {
  if (!properties) return
  const pathArr = pathToArr(path);
  let temp: any = properties;
  if (pathArr.length === 0) {
    return temp;
  }
  pathArr.forEach((item, index) => {
    const name = item;
    if (index === 0) {
      temp = temp[name];
    } else {
      temp = temp?.properties?.[name];
    }
  });
  if (attributeName) {
    return deepGet(temp, attributeName);
  }
  return temp;
};

// 根据index获取目标项
export const getKeyValueByIndex = (properties: PropertiesData, index?: number, parent?: { path?: string; attributeName?: string }) => {
  if (typeof properties != 'object' || typeof index !== 'number') return [];
  const { path, attributeName } = parent || {};
  const parentItem = getItemByPath(properties, path, attributeName);
  const childs = attributeName ? parentItem : (path ? parentItem?.properties : parentItem);
  const childKeys = Object.keys(childs || {});
  const isList = childs instanceof Array;
  const key = isList ? index : childKeys[index];
  return [key, childs[key]];
}

// 转化为有序列表
export const toEntries = (data: any) => {
  const temp: Array<[string, any]> = [];
  const isList = data instanceof Array;
  if (typeof data === 'object') {
    for (let key of Object.keys(data)) {
      const field = data[key];
      temp.push([key, field]);
    }
  }
  return {
    isList,
    entries: temp
  };
};

// 从有序列表中还原源数据
const parseEntries = (entriesData?: { entries: Array<[string, any]>, isList?: boolean }) => {
  const { isList, entries = [] } = entriesData || {};
  const temp = isList ? [] : {};
  if (typeof entries === 'object') {
    for (let key of Object.keys(entries)) {
      const item = entries[key];
      const itemKey = item?.[0];
      const itemData = item?.[1];
      // 还原数据
      if (isList) {
        temp[key] = itemData;
      } else if (typeof itemKey === 'string') {
        temp[itemKey] = itemData;
      }
    }
    return temp;
  }
};

// 更新指定路径的name
export const updateName = (properties: PropertiesData, newName?: string, pathStr?: string) => {
  const end = getPathEnd(pathStr);
  if (typeof newName !== 'string' || !pathStr || end === newName) return properties;
  const parentPath = getParent(pathStr);
  const parent = getItemByPath(properties, parentPath);
  const childProperties = parentPath ? parent?.properties : parent;
  const entriesData = toEntries(childProperties);
  // 只有对象才会去更新键名
  if (!entriesData?.isList) {
    entriesData?.entries?.map((item) => {
      if (item?.[0] === end && end) {
        item[0] = newName;
      }
    })
  }
  const result = parseEntries(entriesData);
  if (parentPath) {
    parent.properties = result;
    return properties;
  } else {
    return result;
  }
}

// 插入数据
export type InsertItemType = Array<any> | Object | any;
export const insertItemByIndex = (properties: PropertiesData, data: InsertItemType, index?: number, parent?: { path?: string; attributeName?: string }) => {
  const { path, attributeName } = parent || {};
  const parentItem = getItemByPath(properties, path, attributeName);
  const childs = attributeName ? parentItem : (path ? parentItem?.properties : parentItem);
  const entriesData = toEntries(childs);
  const isList = entriesData?.isList;
  let addItems: Array<[string, any]> = [];
  if (isList) {
    // 数组添加选项
    const dataList = data instanceof Array ? data : [data];
    addItems = dataList?.map((item, i) => [`${i}`, item]);
  } else {
    // 对象添加属性
    addItems = Object.entries(data || {});
  }
  if (typeof index === 'number') {
    entriesData?.entries?.splice(index, 0, ...addItems);
  } else {
    entriesData?.entries?.push(...addItems);
  }
  const changedChilds = parseEntries(entriesData);
  if (path) {
    if (attributeName) {
      const result = setItemByPath(properties, changedChilds, path, attributeName);
      return result;
    } else {
      parentItem.properties = changedChilds;
      return properties;
    }
  } else {
    return changedChilds;
  }
};

// 同级调换位置
export const moveSameLevel = (properties: PropertiesData, from: { parent?: string, index: number }, to: { parent?: string, index?: number }) => {
  // 拖拽源
  const fromParentPath = from?.parent;
  const fromIndex = from?.index;
  // 拖放源
  const toParentPath = to?.parent;
  let toIndex = to?.index;
  // 同域排序
  if (fromParentPath === toParentPath) {
    let fromParent = getItemByPath(properties, fromParentPath);
    const childProperties = fromParentPath ? fromParent?.properties : fromParent;
    // 转成列表以便排序
    const entriesData = toEntries(childProperties);
    const entries = entriesData?.entries;
    toIndex = typeof toIndex === 'number' ? toIndex : entries?.length;
    entriesData.entries = arrayMove(entries, fromIndex, toIndex);
    const result = parseEntries(entriesData);
    if (fromParentPath) {
      fromParent.properties = result;
      return properties;
    } else {
      return result;
    }
  }
};

// 跨级调换位置
export const moveDiffLevel = (properties: PropertiesData, from: { parent?: string, index: number }, to: { parent?: string, index?: number }) => {
  // 拖拽源
  const fromParentPath = from?.parent;
  const fromIndex = from?.index;
  const fromParentPathArr = pathToArr(fromParentPath);
  const [fromKey, fromValue] = getKeyValueByIndex(properties, fromIndex, { path: fromParentPath });
  const insertItem = typeof fromKey === 'number' ? fromValue : (fromKey && { [fromKey]: fromValue });
  const fromPath = joinFormPath(fromParentPath, fromKey);
  // 拖放源
  const toParentPath = to?.parent;
  const toIndex = to?.index;
  const toParentPathArr = pathToArr(toParentPath);
  if (typeof fromPath !== 'string') return properties;
  // 先计算内部变动，再计算外部变动
  if (fromParentPathArr?.length > toParentPathArr?.length || !toParentPathArr?.length) {
    setItemByPath(properties, undefined, fromPath);
    const result = insertItemByIndex(properties, insertItem, toIndex, { path: toParentPath });
    return result;
  } else {
    const result = insertItemByIndex(properties, insertItem, toIndex, { path: toParentPath });
    result && setItemByPath(result, undefined, fromPath);
    return result;
  }
};

// 提取properties中的默认值
export const getInitialValues = (properties?: PropertiesData) => {
  if (typeof properties !== 'object') return
  let initialValues = {};
  // 遍历处理对象树中的非properties字段
  const deepHandle = (formField: FormFieldProps, path: string) => {
    for (const propsKey of Object.keys(formField)) {
      if (propsKey !== 'properties') {
        const propsValue = formField[propsKey]
        if (propsKey === 'initialValue' && propsValue !== undefined) {
          initialValues = deepSet(initialValues, path, propsValue);
        }
      } else {
        const childProperties = formField[propsKey]
        if (childProperties) {
          for (const childKey of Object.keys(childProperties)) {
            const childField = childProperties[childKey];
            const childName = childKey;
            if (typeof childName === 'number' || typeof childName === 'string') {
              const childPath = joinFormPath(path, childName) as string;
              deepHandle(childField, childPath);
            }
          }
        }
      }
    }
  };

  for (const key of Object.keys(properties)) {
    const childField = properties[key];
    const childName = key;
    if (typeof childName === 'number' || typeof childName === 'string') {
      const childPath = joinFormPath(childName) as string;
      deepHandle(childField, childPath);
    }
  }
  return initialValues;
}

// 展平properties中的控件，键为表单路径
export const setExpandComponents = (properties?: PropertiesData): { [key: string]: FormFieldProps } | undefined => {
  if (typeof properties !== 'object') return
  let componentsMap = {};
  // 遍历处理对象树中的非properties字段
  const deepHandle = (formField: FormFieldProps, path: string) => {
    if (isEmpty(formField['properties'])) {
      if (path) {
        componentsMap[path] = formField;
      }
    } else {
      const parent = path;
      const childProperties = formField['properties'];
      if (childProperties) {
        for (const key of Object.keys(childProperties)) {
          const childField = childProperties[key];
          const childName = key;
          if (typeof childName === 'string') {
            const childPath = joinFormPath(parent, childField?.ignore ? undefined : childName) as string;
            deepHandle(childField, childPath);
          }
        }
      }
    }
  };

  for (const key of Object.keys(properties)) {
    const childField = properties[key];
    const childName = key;
    if (typeof childName === 'string') {
      const childPath = joinFormPath(childField?.ignore ? undefined : childName) as string;
      deepHandle(childField, childPath);
    }
  }
  return componentsMap;
}

// 解析组件声明
export const parseFromField = (target: FieldUnionType | undefined, typeMap?: { [key: string]: React.ElementType }) => {
  if (target === undefined) return;
  if (isValidChildren(target)) return null;
  // 是否为类或函数组件声明
  if (isReactComponent(target)) {
    return target as any
  }
  // 是否为已注册的组件声明
  if (typeof target === 'object' && target) {
    const targetInfo = target as FormComponent;
    const register = typeMap && targetInfo?.type && typeMap[targetInfo?.type];
    if (register) {
      return register
    }
  }
  return null;
}