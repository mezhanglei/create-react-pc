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

// 交换两个路径的位置
export const swapItemByPath = (properties: SchemaData['properties'], from: { parentPath?: string, index: number }, to: { parentPath?: string, index: number }) => {
  // const dataList = objToArr(properties);
  const fromParentPath = from?.parentPath;
  const fromIndex = from?.index;
  const toParentPath = to?.parentPath;
  const toIndex = to?.index;
  // 同域排序
  if (fromParentPath === toParentPath) {
    if (fromParentPath) {
      const parent = getItemByPath(properties, fromParentPath);
      const subList = objToArr(parent?.properties);
      const result = arraySwap(subList, fromIndex, toIndex);
      const resultType = getPropertiesType(parent?.properties);
      parent.properties = handleList(result, resultType);
      return properties;
    } else {
      const list = objToArr(properties);
      const result = arraySwap(list, fromIndex, toIndex);
      const resultType = getPropertiesType(properties);
      const swapResult = handleList(result, resultType);
      return swapResult;
    }
  } else {
    // 跨域排序

  }
}