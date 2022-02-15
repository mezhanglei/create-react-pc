// 是否存在前缀
export function isExitPrefix(prefix: string, path: string | string[]) {
  const prefixParts = prefix?.replace?.(/\[/g, '.').replace(/\]/g, '').split('.');
  const parts = !Array.isArray(path) ? path.replace(/\[/g, '.').replace(/\]/g, '').split('.') : path;
  if (prefixParts?.length > parts?.length || !prefixParts?.length || !parts?.length) {
    return false;
  }
  return prefixParts?.every((str, index) => {
    return str === parts[index]
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
