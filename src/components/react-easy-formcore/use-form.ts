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
export function useFormError(form: FormStore, path?: string, immediate = true) {
  const [error, setError] = useState();

  const subscribeError = () => {
    if (!path || !form) return
    form.subscribeError(path, () => {
      const error = form?.getFieldError(path);
      setError(error);
    });
  };

  useMemo(() => {
    if (!immediate) return
    subscribeError();
  }, [form, JSON.stringify(path)]);

  // 订阅组件更新错误的函数
  useEffect(() => {
    subscribeError();
    return () => {
      form && form.unsubscribeError(path);
    };
  }, [form, JSON.stringify(path)]);

  return [error, setError];
}

// 获取表单值
export function useFormValues<T = unknown>(form: FormStore, path?: string | string[], immediate = true) {
  const [formValues, setFomValues] = useState<T>();

  const isChar = (key?: any) => typeof key === 'string' || typeof key === 'number';

  const subscribeForm = () => {
    if (!form) return;
    const pathList = path === undefined ? Object.keys(form.getFieldProps() || {}) : (path instanceof Array ? path : [path]);
    pathList.map((key) => {
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
  };

  useMemo(() => {
    if (!immediate) return
    subscribeForm();
  }, [form, JSON.stringify(path)]);

  useEffect(() => {
    subscribeForm();
    return () => {
      const pathList = path === undefined ? Object.keys(form.getFieldProps() || {}) : (path instanceof Array ? path : [path]);
      pathList?.forEach((key) => {
        form.unsubscribeFormGlobal(key);
      });
    }
  }, [form, JSON.stringify(path)]);

  return formValues;
}
