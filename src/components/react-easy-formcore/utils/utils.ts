import { pathToArr, deepGet, deepSet } from "@/utils/object";
import { isEmpty, isNumberStr } from "@/utils/type";
import { TriggerType } from "../item-core";
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

// 是否携带中括号
export const isWithBracket = (part?: any) => {
  return typeof part === 'string' && (/\[(\d+)\]/gi.test(part))
}

// 是否为数组索引项
export const isValidNumber = (item?: any) => isNumberStr(item);

// 由前到后拼接当前项的表单的path
export function joinFormPath(...args: Array<any>) {
  const result = args?.reduce((pre, cur) => {
    const curName = isEmpty(cur) ? '' : (isValidNumber(cur) ? `[${cur}]` : cur);
    const parent = isEmpty(pre) ? '' : (isValidNumber(pre) ? `[${pre}]` : pre);
    if (isWithBracket(curName)) {
      return parent && curName ? `${parent}${curName}` : (curName || parent);
    } else {
      return parent && curName ? `${parent}.${curName}` : (curName || parent);
    }
  });
  return result;
};

// 是否触发校验规则
export const validateTriggerCondition = (eventName?: TriggerType | boolean, validateTrigger?: TriggerType | TriggerType[],) => {
  // 不设置validateTrigger允许触发
  if (validateTrigger === undefined || eventName === undefined) return true;
  // 如果为布尔值则返回该值
  if (typeof eventName === 'boolean') return eventName;
  if (typeof validateTrigger === 'string') {
    return validateTrigger === eventName;
  }
  if (validateTrigger instanceof Array) {
    return validateTrigger?.includes(eventName)
  }
}

export function toArray<T>(list: T | T[]): T[] {
  if (!list) {
    return [];
  }
  return Array.isArray(list) ? list : [list];
}
