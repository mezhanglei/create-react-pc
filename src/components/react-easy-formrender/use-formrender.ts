import { useEffect, useMemo, useState } from 'react';
import { FormRenderStore } from './formrender-store';
import { FormNodeProps, PropertiesData } from './types';
import { setExpandComponents } from './utils/utils';

export function useFormRenderStore() {
  return useMemo(() => new FormRenderStore(), [])
}

// 获取properties的state数据
export function useProperties(formrender: FormRenderStore, immediate = true) {
  const [properties, setProperties] = useState<PropertiesData>();

  const subscribeData = () => {
    if (!formrender) return
    formrender.subscribeProperties((newValue) => {
      setProperties(newValue);
    });
  }

  useMemo(() => {
    if (!immediate) return
    subscribeData();
  }, [formrender]);

  useEffect(() => {
    subscribeData()
    return () => {
      formrender.unsubscribeProperties();
    };
  }, [formrender]);

  return [properties, setProperties];
}

// 展平开来的组件
export function useExpandComponents(formrender: FormRenderStore, immediate = true) {
  const [components, setComponents] = useState<{ [key: string]: FormNodeProps }>();

  const subscribeData = () => {
    if (!formrender) return
    // 订阅目标控件
    formrender.subscribeProperties((newValue) => {
      const result = setExpandComponents(newValue);
      setComponents(result);
    });
  }

  useMemo(() => {
    if (!immediate) return
    subscribeData();
  }, [formrender]);

  useEffect(() => {
    subscribeData
    return () => {
      formrender.unsubscribeProperties();
    };
  }, [formrender]);

  return [components, setComponents];
}
