import { FormFieldProps, SchemaData } from "../types";

export const pathToArray = (pathStr?: string) => pathStr ? `${pathStr}`.split('.') : [];
// 根据路径更新properties
export const updatePropertiesByPath = (properties: SchemaData['properties'], pathStr: string, data?: Partial<FormFieldProps>) => {
  const pathArr = pathToArray(pathStr);
  const pathLen = pathArr?.length;
  let temp: any = properties;
  pathArr.forEach((item, index) => {
    const path = item?.replace(/\[/g, '').replace(/\]/g, '');
    if (index === pathLen - 1) {
      if (data === undefined) {
        delete temp[path];
      } else {
        const lastData = temp[path];
        temp[path] = { ...lastData, ...data };
      }
    } else if (index == 0) {
      temp = properties?.[path];
    } else {
      temp = temp?.properties?.[path];
    }
  });
  return properties;
};

// 覆盖properties中指定路径的值
export const setPropertiesByPath = (properties: SchemaData['properties'], pathStr: string, data?: Partial<FormFieldProps>) => {
  const pathArr = pathToArray(pathStr);
  const pathLen = pathArr?.length;
  let temp: any = properties;
  pathArr.forEach((item, index) => {
    const path = item?.replace(/\[/g, '').replace(/\]/g, '');
    if (index === pathLen - 1) {
      if (data === undefined) {
        delete temp[path];
      } else {
        temp[path] = data;
      }
    } else if (index == 0) {
      temp = properties?.[path];
    } else {
      temp = temp?.properties?.[path];
    }
  });
  return properties;
};