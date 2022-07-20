import { FormOptions } from "../form-options-context";
import { formatPath, pathToArr } from "@/utils/object";
export { formatPath, pathToArr };

// 是否存在前缀
export function isExitPrefix(prefix: string, path: string | string[]) {
  const prefixParts = pathToArr(prefix);
  const parts = !Array.isArray(path) ? pathToArr(path) : path;
  if (prefixParts?.length > parts?.length || !prefixParts?.length || !parts?.length) {
    return false;
  }
  return prefixParts?.every((str, index) => {
    const item = formatPath(parts[index]);
    return str === item;
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

// 判断字符是否是数组中的选项
export const isListItem = (item: string) => (/\[(\d+?)\]/gi.test(item));

// 列宽
export const getColProps = (option: FormOptions) => {
  const { inline, col } = option;
  const { xs, sm, md, lg, span, ...restProps } = col || {};
  const maxspan = 12;
  // 计算layout带来的影响
  const getValue = (inline?: boolean, value?: number) => {
    if (!inline) {
      return value ?? (span || maxspan);
    }
  }
  return {
    xs: getValue(inline, xs),
    sm: getValue(inline, sm),
    md: getValue(inline, md),
    lg: getValue(inline, lg),
    ...restProps
  }
}

// 拼接当前项的path
export const getCurrentPath = (name?: string, parent?: string) => {
  if (name === undefined) return name;
  if (isListItem(name)) {
    return parent ? `${parent}${name}` : name;
  } else {
    return parent ? `${parent}.${name}` : name;
  }
};
