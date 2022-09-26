import { useEffect, useMemo, useState } from 'react'

import { FormStore } from './form-store'
import Validator from './validator'

export function useFormStore<T extends Object = any>(
  values?: Partial<T>
) {
  return useMemo(() => new FormStore(values), [])
}

export function useValidator() {
  return useMemo(() => new Validator(), [])
}

// 获取error信息
export function useFormError(store: FormStore, path?: string) {
  const storeError = path && store.getFieldError(path);
  const [error, setError] = useState(storeError);
  // 订阅组件更新错误的函数
  useEffect(() => {
    if (!path || !store) return
    // 订阅目标控件
    const uninstall = store.subscribeError(path, () => {
      const error = store?.getFieldError(path);
      setError(error);
    });
    return () => {
      uninstall();
    };
  }, [path, store]);
  return [error, setError];
}
