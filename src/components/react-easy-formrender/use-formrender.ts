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

  const uninstall = useMemo(() => {
    if (!formrender) return
    return formrender.subscribeProperties((newValue) => {
      setProperties(newValue);
    });
  }, [formrender]);

  useEffect(() => {
    return () => {
      uninstall?.();
    };
  }, [formrender]);

  return [properties, setProperties];
}

// 展平开来的组件
export function useExpandComponents(formrender: FormRenderStore) {
  const [components, setComponents] = useState<{ [key: string]: FormNodeProps }>();

  const uninstall = useMemo(() => {
    if (!formrender) return
    // 订阅目标控件
    return formrender.subscribeProperties((newValue) => {
      const result = setExpandComponents(newValue);
      setComponents(result);
    });
  }, [formrender]);

  useEffect(() => {
    return () => {
      uninstall?.();
    };
  }, [formrender]);

  return [components, setComponents];
}
