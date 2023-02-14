import { useEffect, useMemo, useState } from 'react';
import { FormRenderStore } from './formrender-store';
import { FormFieldProps, PropertiesData } from './types';
import { setExpandControl } from './utils/utils';

export function useFormRenderStore() {
  return useMemo(() => new FormRenderStore(), [])
}

// 获取properties的state数据
export function useProperties(store: FormRenderStore) {
  const [properties, setProperties] = useState<PropertiesData>();
  // 订阅组件更新错误的函数
  useEffect(() => {
    if (!store) return
    // 订阅目标控件
    const uninstall = store.subscribeProperties((newValue, oldValue) => {
      setProperties(newValue);
    })
    return () => {
      uninstall();
    };
  }, [store]);
  return [properties, setProperties];
}

// 获取expandControl的state数据
export function useExpandControl(store: FormRenderStore) {
  const [controls, setControls] = useState<{ [key: string]: FormFieldProps }>();
  // 订阅组件更新错误的函数
  useEffect(() => {
    if (!store) return
    // 订阅目标控件
    const uninstall = store.subscribeProperties((newValue, oldValue) => {
      const result = setExpandControl(newValue);
      setControls(result)
    });
    return () => {
      uninstall();
    };
  }, [store]);
  return [controls, setControls];
}
