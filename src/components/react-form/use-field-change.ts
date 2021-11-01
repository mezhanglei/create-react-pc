import { useEffect } from 'react'

import { FormStore } from './form-store'

export function useFieldChange<T> (
  store: FormStore<T> | undefined,
  name: string | undefined,
  onChange: () => void
) {
  useEffect(() => {
    if (!name || !store) return
    // 订阅目标控件
    return store.subscribe(name, onChange)
  }, [name, store])
}
