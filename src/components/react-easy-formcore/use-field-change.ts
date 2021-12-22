import { useEffect } from 'react'

import { FormStore } from './form-store'

// 监听表单域值的变化
export interface FieldChangeProps<T> {
  store: FormStore<T> | undefined
  name: string | undefined
  onChange: (name: string) => void
  onError: (name: string) => void
}
export function useFieldChange<T>(props: FieldChangeProps<T>) {
  const {
    name,
    store,
    onChange,
    onError
  } = props;

  // 订阅组件的值的变化函数
  useEffect(() => {
    if (!name || !store) return
    // 订阅目标控件
    const uninstall = store.subscribeValue(name, onChange)

    return () => {
      uninstall()
    }
  }, [name, store])

  // 订阅组件的错误的变化函数
  useEffect(() => {
    if (!name || !store) return
    // 订阅目标控件
    const uninstall = store.subscribeError(name, onError)
    return () => {
      uninstall()
    }
  }, [name, store])
}
