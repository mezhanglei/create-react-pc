import { pickObject } from '@/utils/object'
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

  const subscribeError = () => {
    if (!path || !form) return
    form.subscribeError(path, () => {
      const error = form?.getFieldError(path);
      setError(error);
    });
  };

  useMemo(() => {
    subscribeError();
  }, []);

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
export function useFormValues<T = unknown>(form: FormStore, path?: string | string[]) {
  const [formValues, setFomValues] = useState<T>();

  const subscribeForm = () => {
    if (!form) return;
    form.subscribeFormValues((newVal) => {
      if (path == undefined) {
        setFomValues(newVal);
      } else {
        const keys = path instanceof Array ? path : [path];
        const result = keys ? pickObject(newVal, keys) : newVal;
        setFomValues(result);
      }
    });
  };

  useMemo(() => {
    subscribeForm();
  }, []);

  useEffect(() => {
    subscribeForm();
    return () => {
      form.unsubscribeFormValues();
    }
  }, [form, JSON.stringify(path)]);

  return formValues;
}
