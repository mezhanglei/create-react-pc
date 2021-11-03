import { useEffect } from 'react'

import { FormRule, FormStore } from './form-store'

// 监听表单域
export interface FieldChangeProps<T> {
  store: FormStore<T> | undefined
  name: string | undefined
  onChange: () => void
  rules?: FormRule[]
}
export function useFieldChange<T>(props: FieldChangeProps<T>) {
  const {
    name,
    store,
    rules,
    onChange
  } = props;

  useEffect(() => {
    if (!name || !store) return
    // 订阅目标控件
    const uninstall = store.subscribe(name, onChange)

    return () => {
      uninstall()
    }
  }, [name, store])

  useEffect(() => {
    if (!name || !store) return
    store?.setFieldRules(name, rules)
  }, [name, store, rules])

}
