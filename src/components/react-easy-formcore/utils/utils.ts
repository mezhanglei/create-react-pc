import { FormOptions } from "../form-options-context";

// 是否存在前缀
export function isExitPrefix(prefix: string, path: string | string[]) {
  const prefixParts = prefix?.replace?.(/\[/g, '.').replace(/\]/g, '').split('.');
  const parts = !Array.isArray(path) ? path.replace(/\[/g, '.').replace(/\]/g, '').split('.') : path;
  if (prefixParts?.length > parts?.length || !prefixParts?.length || !parts?.length) {
    return false;
  }
  return prefixParts?.every((str, index) => {
    const item = parts[index]?.replace(/\[/g, '').replace(/\]/g, '');
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
export const isListItem = (item: string) => (/\[(.{1}?)\]/gi.test(item));

// 列宽
export const getColProps = (option: FormOptions) => {
  const { layout, col } = option;
  const { xs, sm, md, lg, span, ...restProps } = col || {};
  const maxspan = 12;
  // inline时不传参数
  const defaultspan = layout !== "inline" && (span ?? maxspan);
  return {
    xs: xs !== undefined ? xs : defaultspan,
    sm: sm !== undefined ? sm : defaultspan,
    md: md !== undefined ? md : defaultspan,
    lg: lg !== undefined ? lg : defaultspan,
    ...restProps
  }
}
