import { arrayMove } from "@/utils/array";
import { FormFieldProps, PropertiesData } from "../types";
import { pathToArr, deepSet, joinPath, formatName } from "../../react-easy-formcore";
import { isEmpty } from "@/utils/type";

// 匹配字符串表达式
export const matchExpression = (value?: any) => {
  if (typeof value === 'string') {
    const reg = new RegExp('\{\{\s*.*?\s*\}\}', 'g');
    const result = value?.match(reg)?.[0];
    return result;
  }
}

export const formatPath = (path?: string) => {
  const pathArr = pathToArr(path)
  if(!(pathArr instanceof Array)) return;
  const result = joinPath(...pathArr)
  return result;
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

// 判断字符串是否为路径的尾部
export const isPathEnd = (path?: string, name?: string) => {
  if (path && !isEmpty(name)) {
    return path === name || new RegExp(`\\[\\d+\\]$|\\.${name}$|\\]${name}$`).test(path)
  }
}

// 更改path的末尾项
export const changePathEnd = (oldPath: string, endName: string | number) => {
  if (!isEmpty(endName) && oldPath) {
    const parent = getParent(oldPath);
    const newPath = joinPath(parent, endName);
    return newPath;
  }
}

// 根据路径返回在父元素中的当前位置, 没有则返回-1;
export const getPathEndIndex = (path?: string, properties?: PropertiesData) => {
  const parentPath = getParent(path);
  const end = getPathEnd(path);
  return getEndIndex(end, properties, parentPath)
}

// 返回在父元素中的当前位置, 没有则返回-1;
export const getEndIndex = (end?: string, properties?: PropertiesData, parentPath?: string) => {
  const parent = getItemByPath(properties, parentPath);
  const childProperties = parentPath ? parent?.properties : properties;
  const keys = Object.keys(childProperties || {});
  const index = end ? keys?.indexOf(end) : -1;
  return index;
}

// 根据路径更新数据
export const updateItemByPath = (properties: PropertiesData, pathStr?: string, data?: Partial<FormFieldProps>) => {
  const pathArr = pathToArr(pathStr);
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
export const setItemByPath = (properties: PropertiesData, pathStr?: string, data?: Partial<FormFieldProps>) => {
  const pathArr = pathToArr(pathStr);
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
export const getItemByPath = (properties?: PropertiesData, pathStr?: string) => {
  if (!properties) return
  const pathArr = pathToArr(pathStr);
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
  return temp;
};

// 根据index获取目标项
export const getItemByIndex = (properties: PropertiesData, index: number, parentPath?: string) => {
  const parent = getItemByPath(properties, parentPath);
  const childProperties = parentPath ? parent?.properties : parent;
  const childKeys = Object.keys(childProperties);
  const key = childKeys[index];
  const isList = childProperties instanceof Array;
  const field = childProperties[key]
  return field ? {
    name: isList ? index : key,
    ...field
  } : undefined
};

// 转化为有序数组列表
export const toList = (properties: PropertiesData) => {
  const temp = [];
  const isList = properties instanceof Array;
  if (typeof properties === 'object') {
    for (let key in properties) {
      const field = properties[key];
      if (isList) {
        temp.push(field);
      } else {
        temp.push({ name: key, ...field });
      }
    }
  }
  return temp;
};

// 从有序列表中还原源数据
const parseList = (dataList: FormFieldProps[], isList?: boolean) => {
  const temp = isList ? [] : {};
  if (typeof dataList === 'object') {
    for (let key in dataList) {
      const field = dataList[key];
      const name = field?.name;
      delete field['name'];
      if (isList) {
        // 还原成数组
        temp[key] = field;
      } else {
        // 还原成对象
        if (typeof name === 'string') {
          temp[name] = field;
        }
      }
    }
    return temp;
  }
};

// 更新指定路径的name
export const updateName = (properties: PropertiesData, pathStr?: string, newName?: string) => {
  if (typeof newName !== 'string' || !pathStr || isPathEnd(pathStr, newName)) return properties;
  const parentPath = getParent(pathStr);
  const end = getPathEnd(pathStr)
  const parent = getItemByPath(properties, parentPath);
  const childProperties = parentPath ? parent?.properties : parent;
  const childList = toList(childProperties);
  childList?.map((item) => {
    if (item.name === end && end) {
      item.name = newName;
    }
  });
  const isList = childProperties instanceof Array;
  const result = parseList(childList, isList);
  if (parentPath) {
    parent.properties = result;
    return properties;
  } else {
    return result;
  }
}

// 添加新元素(有副作用，会改变传入的data数据)
export const addItemByIndex = (properties: PropertiesData, data: FormFieldProps | FormFieldProps[], index?: number, parentPath?: string) => {
  const parent = getItemByPath(properties, parentPath);
  const childProperties = parentPath ? parent?.properties : parent;
  const childList = toList(childProperties);
  const dataList = data instanceof Array ? data : (data ? [data] : [])
  const fromList = dataList;
  if (typeof index === 'number') {
    childList?.splice(index, 0, ...fromList);
  } else {
    childList?.push(...fromList);
  }
  const isList = childProperties instanceof Array;
  const result = parseList(childList, isList);
  if (parentPath) {
    parent.properties = result;
    return properties;
  } else {
    return result;
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
    const childList = toList(childProperties);
    toIndex = typeof toIndex === 'number' ? toIndex : childList?.length;
    const moveList = arrayMove(childList, fromIndex, toIndex);
    const isList = childProperties instanceof Array;
    const result = parseList(moveList, isList);
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
  const fromItem = getItemByIndex(properties, fromIndex, fromParentPath);
  const fromPath = joinPath(fromParentPath, fromItem?.name);
  // 拖放源
  const toParentPath = to?.parent;
  const toIndex = to?.index;
  const toParentPathArr = pathToArr(toParentPath);
  if (typeof fromPath !== 'string') return properties;
  // 先计算内部变动，再计算外部变动
  if (fromParentPathArr?.length > toParentPathArr?.length || !toParentPathArr?.length) {
    setItemByPath(properties, fromPath, undefined);
    const result = addItemByIndex(properties, fromItem, toIndex, toParentPath);
    return result;
  } else {
    const result = addItemByIndex(properties, fromItem, toIndex, toParentPath);
    result && setItemByPath(result, fromPath, undefined);
    return result;
  }
};

// 提取properties中的默认值
export const getInitialValues = (properties?: PropertiesData) => {
  if (typeof properties !== 'object') return
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
          const childName = formatName(childKey, children instanceof Array);
          if (typeof childName === 'number' || typeof childName === 'string') {
            const childPath = joinPath(path, childName) as string;
            deepHandle(childField, childPath);
          }
        }
      }
    }
  };

  for (const key in properties) {
    const formField = properties[key];
    const childName = formatName(key, properties instanceof Array);
    if (typeof childName === 'number' || typeof childName === 'string') {
      const childPath = joinPath(childName) as string;
      deepHandle(formField, childPath);
    }
  }
  return initialValues;
}
