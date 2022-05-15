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
export const getItemByPath = (properties: SchemaData['properties'], pathStr: string) => {
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

// 交换两个路径的位置
export const swapItemByPath = (properties: SchemaData['properties'], pathStr1: string, pathStr2: string) => {
  let temp = properties;
  
}