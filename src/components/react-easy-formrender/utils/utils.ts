import { FormFieldProps, SchemaData } from "../types";

export const pathToArray = (pathStr?: string) => pathStr ? `${pathStr}`.split('.') : [];
// 根据路径设置properties
export const setPropertiesByPath = (properties: SchemaData['properties'], pathStr: string, data?: Partial<FormFieldProps>) => {
  const pathArr = pathToArray(pathStr);
  let parent: any;
  pathArr.forEach((item, index) => {
    if (index == 0) {
      parent = properties?.[item];
    } else {
      parent = parent.properties?.[item?.replace(/\[/g, '').replace(/\]/g, '')];
    }
  });
  console.log(parent, 222)
  parent.properties = data;
  return properties;
};