import { isArray, isObject } from "@/utils/type";
import { produce } from "immer"

// 获取表单值中指定的字段值
export function deepGetForm (obj: any, path: string) {
  const parts = path.split('.')
  const length = parts.length

  for (let i = 0; i < length; i++) {
    if (!isObject(obj)) return undefined
    obj = obj[parts[i]]
  }

  return obj
}

// 给表单设置的值
export function deepSetForm (obj: any, path: string, value: any) {
  const parts = path.split('.');
  const key = parts?.[0];
  if (!isObject(obj) || !key) return obj
  const newObj = produce(obj, (draft: any) => {
    draft[key] = value
  })
  return newObj;
}

export function deepCopy<T> (target: T): T {
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

// 获取表单的值的props的变量
export function getPropName (valueProp: string | ((type: any) => string), type: any) {
  return typeof valueProp === 'function' ? valueProp(type) : valueProp
}

// 根据表单的onChange获取值
export function getValueFromEvent (...args: any[]) {
  const e = args[0] as React.ChangeEvent<any>
  return e && e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e
}
