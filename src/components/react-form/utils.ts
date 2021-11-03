import { isObject } from "@/utils/type";
import { produce } from "immer"

// 获取表单值中指定的字段值
export function deepGetForm(obj: any, name: string | string[]) {
  if (!isObject(obj) || !name) return obj;
  if (Array.isArray(name)) {
    const ret: any[] = [];
    name?.forEach(key => {
      if (key) {
        ret?.push(obj[key])
      }
    });
    return ret;
  }
  return obj[name]
}

// 给表单设置的值
export function deepSetForm(obj: any, name: string, value: any) {
  if (!isObject(obj) || !name) return obj
  const newObj = produce(obj, (draft: any) => {
    draft[name] = value
  })
  return newObj;
}

export function deepCopy<T>(target: T): T {
  const type = typeof target

  if (target === null || type === 'boolean' || type === 'number' || type === 'string') {
    return target
  }

  if (target instanceof Date) {
    return new Date(target.getTime()) as any
  }

  if (Array.isArray(target)) {
    return target.map((o) => deepCopy(o)) as any
  }

  if (typeof target === 'object') {
    const obj: any = {}

    for (let key in target) {
      obj[key] = deepCopy(target[key])
    }

    return obj
  }

  return undefined as any
}

// 表单值的键名
export function getPropValueName(valueProp: string | ((type: any) => string), type: any) {
  return typeof valueProp === 'function' ? valueProp(type) : valueProp
}

// 表单的值
export function getValueFromEvent(...args: any[]) {
  const e = args[0] as React.ChangeEvent<any>
  return e && e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e
}
