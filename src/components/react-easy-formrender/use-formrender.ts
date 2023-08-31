import { useEffect, useMemo, useState } from 'react';
import { FormRenderStore } from './formrender-store';
import { PropertiesData } from './types';

export function useFormRenderStore() {
  return useMemo(() => new FormRenderStore(), [])
}

// 获取properties的state数据
export function useProperties(formrender: FormRenderStore) {
  const [properties, setProperties] = useState<PropertiesData>();

  const subscribeData = () => {
    if (!formrender) return
    formrender.subscribeProperties((newValue) => {
      setProperties(newValue);
    });
  }

  useMemo(() => {
    subscribeData();
  }, []);

  useEffect(() => {
    subscribeData()
    return () => {
      formrender.unsubscribeProperties();
    };
  }, [formrender]);

  return [properties, setProperties];
}
