import { useEffect, useMemo, useState } from 'react';
import { FormRenderStore } from './formrender-store';
import { FormNodeProps, PropertiesData } from './types';
import { setExpandComponents } from './utils/utils';

export function useFormRenderStore() {
  return useMemo(() => new FormRenderStore(), [])
}

// 获取properties的state数据
export function useProperties(formrender: FormRenderStore) {
  const [properties, setProperties] = useState<PropertiesData>();

  const uninstallMemo = useMemo(() => {
    if (!formrender) return
    const uninstall = formrender.subscribeProperties((newValue) => {
      setProperties(newValue);
    });
    return uninstall;
  }, [formrender]);

  useEffect(() => {
    return () => {
      uninstallMemo?.();
    };
  }, []);

  return [properties, setProperties];
}

// 展平开来的组件
export function useExpandComponents(formrender: FormRenderStore) {
  const [components, setComponents] = useState<{ [key: string]: FormNodeProps }>();

  const uninstallMemo = useMemo(() => {
    if (!formrender) return
    // 订阅目标控件
    const uninstall = formrender.subscribeProperties((newValue) => {
      const result = setExpandComponents(newValue);
      setComponents(result);
    });
    return uninstall;
  }, [formrender]);

  useEffect(() => {
    return () => {
      uninstallMemo?.();
    };
  }, []);

  return [components, setComponents];
}
