import { arraySwap } from "@/utils/array";
import { FormFieldProps, SchemaData } from "../types";

export const pathToArray = (pathStr?: string) => pathStr ? pathStr.replace(/\[/g, '.').replace(/\]/g, '').split('.') : [];
// 根据路径更新properties
export const updatePropertiesByPath = (properties: SchemaData['properties'], pathStr: string, data?: Partial<FormFieldProps>) => {
  const pathArr = pathToArray(pathStr);
  const end = pathArr.pop();
  const pathLen = pathArr?.length;
  let temp: any = properties;
  pathArr.forEach((item, index) => {
    const path = item?.replace(/\[/g, '').replace(/\]/g, '');
    if (index === 0) {
      temp = temp[path];
    } else {
      temp = temp?.properties?.[path];
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

// 覆盖properties中指定路径的值
export const setPropertiesByPath = (properties: SchemaData['properties'], pathStr: string, data?: Partial<FormFieldProps>) => {
  const pathArr = pathToArray(pathStr);
  const end = pathArr.pop();
  const pathLen = pathArr?.length;
  let temp: any = properties;
  pathArr.forEach((item, index) => {
    const path = item?.replace(/\[/g, '').replace(/\]/g, '');
    if (index === 0) {
      temp = temp[path];
    } else {
      temp = temp?.properties?.[path];
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
    const path = item?.replace(/\[/g, '').replace(/\]/g, '');
    if (index === 0) {
      temp = temp[path];
    } else {
      temp = temp?.properties?.[path];
    }
  });
  return temp;
};

interface DataListType extends FormFieldProps {
  propertiesType?: 'array' | 'object'
  properties?: DataListType[]
}

// 获取类型
const getPropertiesType = (properties: SchemaData['properties']) => {
  if (properties) {
    if (properties instanceof Array) {
      return 'array'
    } else if (typeof properties === 'object') {
      return 'object'
    }
  }
}

// 将树对象转化成树数组
export const objToArr = (properties: SchemaData['properties']) => {
  const temp = [];
  if (typeof properties === 'object') {
    for (let key in properties) {
      const current = properties[key];
      const item = {
        name: key,
        ...current,
        propertiesType: getPropertiesType(current.properties),
        properties: current.properties && objToArr(current.properties)
      } as DataListType;
      temp.push(item);
    }
  }
  return temp;
}
// 将嵌套数组还原成嵌套树对象
const handleList = (dataList: DataListType[], type?: 'array' | 'object') => {
  const temp = type === 'array' ? [] : {};
  if (typeof dataList === 'object') {
    for (let key in dataList) {
      const current = dataList[key];
      const name = current?.name;
      if (typeof name === 'string') {
        temp[name] = current;
        const properties = current?.properties;
        const propertiesType = current?.propertiesType;
        if (properties) {
          temp[name].properties = handleList(properties, propertiesType)
        }
        delete current['propertiesType']
      }
    }
    return temp;
  }
};

// 移除列表中的元素(有副作用, 会改变传入的data数据)
export const removeItem = (properties: SchemaData['properties'], fromIndex: number, parentPath?: string) => {
  const parent = getItemByPath(properties, parentPath);
  const child = parentPath ? parent?.properties : parent;
  const childList = objToArr(child);
  const removeItem = childList[fromIndex];
  childList?.splice(fromIndex, 1);
  const type = getPropertiesType(child);
  const result = handleList(childList, type);
  if (parentPath) {
    parent.properties = result;
    return { properties, removeItem };
  } else {
    return { properties: result, removeItem };
  }
};

// 添加新元素(有副作用，会改变传入的data数据)
export const addItem = (properties: SchemaData['properties'], data: DataListType, toIndex?: number, toParentPath?: string) => {
  const parent = getItemByPath(properties, toParentPath);
  const child = toParentPath ? parent?.properties : parent;
  const childList = objToArr(child);
  if (typeof toIndex === 'number') {
    childList?.splice(toIndex, 0, data);
  } else {
    childList?.push(data);
  }
  const type = getPropertiesType(child);
  const result = handleList(childList, type);
  if (toParentPath) {
    parent.properties = result;
    return properties;
  } else {
    return result;
  }
};

// 同级交换
export const swapSameLevel = (properties: SchemaData['properties'], from: { parentPath?: string, index: number }, to: { parentPath?: string, index: number }) => {
  // 拖拽源
  const fromParentPath = from?.parentPath;
  const fromIndex = from?.index;
  // 拖放源
  const toParentPath = to?.parentPath;
  const toIndex = to?.index;
  // 同域排序
  if (fromParentPath === toParentPath) {
    let parent = getItemByPath(properties, fromParentPath);
    const child = fromParentPath ? parent?.properties : parent;
    const childList = objToArr(child);
    const swapList = arraySwap(childList, fromIndex, toIndex);
    const type = getPropertiesType(child);
    const result = handleList(swapList, type);
    if (fromParentPath) {
      parent.properties = result;
      return properties;
    } else {
      return result;
    }
  }
}
// 跨级交换
export const swapDiffLevel = (properties: SchemaData['properties'], from: { parentPath?: string, index: number }, to: { parentPath?: string, index: number }) => {
  // 拖拽源
  const fromParentPath = from?.parentPath;
  const fromIndex = from?.index;
  const fromParentPathArr = pathToArray(fromParentPath);
  // 拖放源
  const toParentPath = to?.parentPath;
  const toIndex = to?.index;
  const toParentPathArr = pathToArray(toParentPath);

  // 先计算内部变动，再计算外部变动
  if (fromParentPathArr?.length > toParentPathArr?.length || !toParentPathArr?.length) {
    const removeResult = removeItem(properties, fromIndex, fromParentPath);
    const addResult = removeResult?.properties && addItem(removeResult?.properties, removeResult?.removeItem, toIndex, toParentPath);
    return addResult;
  } else {
    const fromParent = getItemByPath(properties, fromParentPath);
    const fromChild = fromParentPath ? fromParent?.properties : fromParent;
    const fromChildList = objToArr(fromChild);
    const fromItem = fromChildList[fromIndex];
    const addResult = addItem(properties, fromItem, toIndex, toParentPath);
    const removeResult = addResult && removeItem(addResult, fromIndex, fromParentPath);
    return removeResult?.properties;
  }
}