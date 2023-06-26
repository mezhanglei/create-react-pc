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

  useMemo(() => {
    if (!path || !form) return
    form.subscribeError(path, () => {
      const error = form?.getFieldError(path);
      setError(error);
    });
  }, [form, JSON.stringify(path)]);

  // 订阅组件更新错误的函数
  useEffect(() => {
    return () => {
      form && form.unsubscribeError(path);
    };
  }, [form, JSON.stringify(path)]);

  return [error, setError];
}

// 获取表单值
export function useFormValues<T = unknown>(form: FormStore, path?: string | string[]) {
  const [formValues, setFomValues] = useState<T>();

  const isChar = (key?: any) => typeof key === 'string' || typeof key === 'number';

  const uninstallList = useMemo(() => {
    if (!form) return;
    const pathList = path === undefined ? Object.keys(form.getFieldProps() || {}) : (path instanceof Array ? path : [path]);
    return pathList.map((key) => {
      if (isChar(key)) {
        return form.subscribeFormGlobal(key, (newVal) => {
          // 返回目标值对象
          if (path) {
            setFomValues((old) => {
              return Object.assign({}, old, { [key]: newVal });
            })
          } else {
            // 返回整个表单值
            const oldValues = form.getFieldValue();
            setFomValues(oldValues);
          }
        })
      }
    });
  }, [form, JSON.stringify(path)]);

  useEffect(() => {
    return () => {
      uninstallList?.forEach((uninstall) => {
        uninstall?.()
      })
    }
  }, [form, JSON.stringify(path)]);

  return formValues;
}
