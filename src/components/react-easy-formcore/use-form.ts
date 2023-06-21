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
export function useFormError(form: FormStore, path?: string) {
  const [error, setError] = useState();

  const uninstallMemo = useMemo(() => {
    if (!path || !form) return
    const uninstall = form.subscribeError(path, () => {
      const error = form?.getFieldError(path);
      setError(error);
    });
    return uninstall;
  }, [form, JSON.stringify(path)]);

  // 订阅组件更新错误的函数
  useEffect(() => {
    return () => {
      uninstallMemo?.();
    };
  }, []);

  return [error, setError];
}

// 获取表单值
export function useFormValues<T = unknown>(form: FormStore, path?: string | string[]) {
  const [formValues, setFomValues] = useState<T>();

  // 订阅目标控件
  const uninstallListMemo = useMemo(() => {
    if (!form) return [];
    const queue = [];
    const isChar = typeof path == 'string' || typeof path == 'number';
    const pathList = isChar ? [path] : (path instanceof Array ? path : Object.keys(form.getFieldProps() || {}))
    for (let i = 0; i < pathList?.length; i++) {
      const pathKey = pathList[i]
      queue?.push(form.subscribeFormGlobal(pathKey, (newValue) => {
        if (typeof pathKey == 'string' || typeof pathKey == 'number') {
          const oldValues = form.getFieldValue(path);
          setFomValues(() => ({ ...oldValues, [pathKey]: newValue }));
        }
      }))
    }
    return queue;
  }, [form, JSON.stringify(path)]);

  useEffect(() => {
    return () => {
      uninstallListMemo?.map((uninstall) => uninstall?.())
    }
  }, []);

  return formValues;
}