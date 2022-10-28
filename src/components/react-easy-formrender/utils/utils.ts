import { arrayMove } from "@/utils/array";
import { FormFieldProps, SchemaData } from "../types";
import { formatName, getCurrentPath, pathToArr, deepSet, isListItem } from "../../react-easy-formcore";
import { isEmpty } from "@/utils/type";

// 拼接当前项的path
export const joinPath = (name?: string, parent?: string) => {
  if (isEmpty(name) || typeof name !== 'string') return parent;
  if (isListItem(name)) {
    return parent ? `${parent}${name}` : name;
  } else {
    return parent ? `${parent}.${name}` : name;
  }
};

// 获取末尾节点字符串
export const getPathEnd = (path: string) => {
  const pathArr = pathToArr(path)
  const end = pathArr?.pop()
  return end;
}

// 根据路径返回父路径(兼容a[0],a.[0],a.b, a[0].b形式的路径)
export const getParent = (path: string) => {
  const end = getPathEnd(path);
  if (typeof end === 'string' && path) {
    const endReg = new RegExp(`\\[\\d+\\]$|\\.${end}$|${end}$`)
    return path.replace(endReg, '')
  }
}

// 路径末尾项是否为数组项
export const endIsListItem = (path: string) => {
  if (typeof path === 'string') {
    const endReg = new RegExp('\\[\\d+\\]$');
    return endReg.test(path)
  }
}

// 判断字符串是否为路径的尾部
export const isPathEnd = (path: string, name: string) => {
  if (path && name) {
    return new RegExp(`\\[\\d+\\]$|\\.${name}$|${name}$`).test(path)
  }
}

// 更改path的末尾项
export const changePathEnd = (oldPath: string, endName: string) => {
  if (endName && oldPath) {
    const parent = getParent(oldPath);
    const newPath = joinPath(endName, parent);
    return newPath;
  }
}

// 根据路径返回在父元素中的当前位置, 没有则返回-1;
export const getPathEndIndex = (path: string, properties?: SchemaData['properties']) => {
  const parentPath = getParent(path);
  const end = getPathEnd(path);
  const parent = getItemByPath(properties, parentPath);
  const childProperties = parentPath ? parent?.properties : properties;
  const keys = Object.keys(childProperties || {});
  const index = end ? keys?.indexOf(end) : -1;
  return index;
}

// 根据路径更新数据
export const updateItemByPath = (properties: SchemaData['properties'], pathStr: string, data?: Partial<FormFieldProps>) => {
  const pathArr = pathToArr(pathStr);
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
  const pathArr = pathToArr(pathStr);
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
  const pathArr = pathToArr(pathStr);
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

// 合并信息
export const mergeField = (name: string, field: FormFieldProps) => {
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
      const item = mergeField(name, field);
      temp.push(item);
    }
  }
  return temp;
};

// 从有序列表中还原源数据
const parseList = (dataList: FormFieldProps[], isList?: boolean) => {
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
  if (typeof newName !== 'string' || !pathStr || isPathEnd(pathStr, newName)) return properties;
  const parentPath = getParent(pathStr);
  const parent = getItemByPath(properties, parentPath);
  const childProperties = parentPath ? parent?.properties : parent;
  const childList = toList(childProperties);
  childList?.map((item, index) => {
    if (index === childList?.length - 1 && item?.name) {
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
export interface AddItem { name: string, field: FormFieldProps };
export const addItemByIndex = (properties: SchemaData['properties'], data: AddItem | AddItem[], index?: number, parentPath?: string) => {
  const parent = getItemByPath(properties, parentPath);
  const childProperties = parentPath ? parent?.properties : parent;
  const childList = toList(childProperties);
  const dataList = data instanceof Array ? data : (data ? [data] : []);
  const fromList = dataList?.map?.((item) => mergeField(item?.name, item?.field));
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
export const moveSameLevel = (properties: SchemaData['properties'], from: { parent?: string, index: number }, to: { parent?: string, index?: number }) => {
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
export const moveDiffLevel = (properties: SchemaData['properties'], from: { parent?: string, index: number }, to: { parent?: string, index?: number }) => {
  // 拖拽源
  const fromParentPath = from?.parent;
  const fromIndex = from?.index;
  const fromParentPathArr = pathToArr(fromParentPath);
  const fromTreeItem = getKeyValueByIndex(properties, fromIndex, fromParentPath);
  const fromPath = getCurrentPath(fromTreeItem?.name, fromParentPath);
  // 拖放源
  const toParentPath = to?.parent;
  const toIndex = to?.index;
  const toParentPathArr = pathToArr(toParentPath);
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
export const getInitialValues = (properties?: SchemaData['properties']) => {
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
