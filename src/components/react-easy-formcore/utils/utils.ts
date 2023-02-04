import { pathToArr, deepGet, deepSet } from "@/utils/object";
import { isEmpty } from "@/utils/type";
import { TriggerType } from "../item-core";
import { TriggerHandle } from "../validator";
export { pathToArr, deepGet, deepSet };

// 是否存在前缀
export function isExitPrefix(prefix: string, path: string | string[]) {
  const prefixParts = pathToArr(prefix);
  const parts = pathToArr(path);
  if (prefixParts?.length > parts?.length || !prefixParts?.length || !parts?.length) {
    return false;
  }
  return prefixParts?.every((item, index) => {
    return item == parts[index];
  });
}

// 表单值的键名
export function getValuePropName(valueProp: string | ((type: any) => string), type: any) {
  return typeof valueProp === 'function' ? valueProp(type) : valueProp
}

// 表单的值
export function getValueFromEvent(...args: any[]) {
  const e = args[0] as React.ChangeEvent<any>
  return e && e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e
}

// 格式化name, 返回正确类型的键(对象的键或者索引序号)
export function formatName(str?: string | number, isList?: boolean) {
  if (typeof str !== 'string' && typeof str !== 'number') return
  // 如果为数字就是数组索引，直接返回
  if (typeof str === 'number') return str;
  // 如果是带中括号的数字字符串则去掉中括号
  const end = str?.replace(/\[/g, '')?.replace(/\]/g, '')
  return isList ? +end : end;
}

// 是否携带中括号
export const isWithBracket = (part?: any) => {
  return typeof part === 'string' && (/\[(\d+)\]/gi.test(part))
}

// 是否为数组索引项
export const isListIndex = (item?: any) => typeof item === 'number' && !isNaN(item);

// 由前到后拼接当前项的path
export function joinPath(...args: Array<any>) {
  const result = args?.reduce((pre, cur) => {
    const curName = isEmpty(cur) ? '' : cur;
    const parent = isEmpty(pre) ? '' : pre;
    if (isListIndex(curName) || isWithBracket(curName)) {
      const end = typeof curName === 'number' ? `[${curName}]` : curName
      return parent ? (end ? `${parent}${end}` : parent) : end;
    } else {
      return parent ? (curName ? `${parent}.${curName}` : parent) : `${curName}`;
    }
  });
  return result;
};

// 是否为表单节点
export const isFormNode = (child: any) => {
  const displayName = child?.type?.displayName;
  const formFields = ['Form.Item', 'Form.List', 'ListCore', 'ItemCore'];
  const dataType = child?.props?.['data-type']; // 标记的需要穿透的外层容器
  return formFields?.includes(displayName) && dataType !== 'ignore'
};

// 校验是否触发
export const handleTrigger = (type?: TriggerHandle, validateTrigger?: TriggerType | TriggerType[],) => {
  // 不设置validateTrigger允许触发
  if (!validateTrigger) return true;
  // validateType传入布尔值则返回该布尔值
  if (typeof type === 'boolean') return type;
  // 没有值则默认可以触发
  if (!type) return true;
  if (typeof validateTrigger === 'string') {
    return validateTrigger === type;
  }
  if (validateTrigger instanceof Array) {
    return validateTrigger?.includes(type)
  }
}

export function toArray<T>(list: T | T[]): T[] {
  if (!list) {
    return [];
  }
  return Array.isArray(list) ? list : [list];
}

