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
export function getValuePropName(valueProp: string | ((type: any) => string), type: any) {
  return typeof valueProp === 'function' ? valueProp(type) : valueProp
}

// 表单的值
export function getValueFromEvent(...args: any[]) {
  const e = args[0] as React.ChangeEvent<any>
  return e && e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e
}
