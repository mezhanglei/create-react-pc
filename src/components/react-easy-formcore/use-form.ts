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

// 获取表单值
export function useFormValues(store: FormStore, path?: string | string[]) {
  const initialValues = store.getFieldValue(path)
  const [formValues, setFomValues] = useState(initialValues)

  const subscribeList = (store: FormStore, path?: string | string[]) => {
    if (!path) return;
    const queue = []
    const pathList = typeof path == 'string' ? [path] : (path instanceof Array ? path : [])
    for (let i = 0; i < pathList?.length; i++) {
      const item = pathList[i]
      queue?.push(store.subscribeFormGlobal(item, (newValue) => {
        if (item) {
          setFomValues((old: any) => ({ ...old, [item]: newValue }))
        }
      }))
    }
    return queue;
  }

  // 订阅更新值的函数
  useEffect(() => {
    if (!path || !store) return
    // 订阅目标控件
    const uninstallList = subscribeList(store, path)

    return () => {
      uninstallList?.map((uninstall) => uninstall?.())
    }
  }, [path, store]);

  return formValues;
}
