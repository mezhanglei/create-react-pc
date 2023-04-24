import { useEffect, useMemo, useState } from 'react';
import { FormRenderStore } from './formrender-store';
import { FormFieldProps, PropertiesData } from './types';
import { setExpandComponents } from './utils/utils';

export function useFormRenderStore() {
  return useMemo(() => new FormRenderStore(), [])
}

// 获取properties的state数据
export function useProperties(store: FormRenderStore) {
  const [properties, setProperties] = useState<PropertiesData>();

  const uninstallMemo = useMemo(() => {
    if (!store) return
    const uninstall = store.subscribeProperties((newValue) => {
      setProperties(newValue);
    });
    return uninstall;
  }, [store]);

  useEffect(() => {
    return () => {
      uninstallMemo?.();
    };
  }, []);

  return [properties, setProperties];
}

// 展平开来的组件
export function useExpandComponents(store: FormRenderStore) {
  const [components, setComponents] = useState<{ [key: string]: FormFieldProps }>();

  const uninstallMemo = useMemo(() => {
    if (!store) return
    // 订阅目标控件
    const uninstall = store.subscribeProperties((newValue) => {
      const result = setExpandComponents(newValue);
      setComponents(result);
    });
    return uninstall;
  }, [store]);

  useEffect(() => {
    return () => {
      uninstallMemo?.();
    };
  }, []);

  return [components, setComponents];
}
