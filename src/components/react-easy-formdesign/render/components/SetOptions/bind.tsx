import React, { useEffect, useState } from 'react';
import request from '@/http/request';
import { objectToFormData } from '@/utils/object';
import { isObject } from '@/utils/type';

/**
 * 自动给目标组件某个数据来源绑定请求，默认该数据的字段为options
 * @param component 目标控件
 * @param codeStr 请求数据源的字段名
 * @returns 
 */

export default function bindRequest(component: any, codeStr: string = "options") {
  const Component = component;
  return React.forwardRef<any, any>(({ optionsType, ...props }, ref) => {
    // 目标参数
    const target = props?.[codeStr];
    // 是否为配置请求
    const isRequestConfig = isObject(target) ? true : false;

    const [response, setResponse] = useState<unknown>();

    useEffect(() => {
      getRequest();
    }, []);

    const getRequest = async () => {
      const {
        url,
        method,
        paramsType,
        params,
        headers,
        returnFn,
      } = target || {};
      if (method && url) {
        const paramsKey = ['get', 'delete'].includes(method) ? 'params' : 'data';
        const data = paramsType === 'formdata' ? objectToFormData(params) : params;
        const result = await request[method](url, {
          [paramsKey]: data,
          headers,
        });
        const formatRes = typeof returnFn == 'function' ? returnFn(result) : result;
        setResponse(formatRes);
      }
    }

    const resultData = isRequestConfig ? (target?.url && codeStr ? response : undefined) : (target instanceof Array ? target : []);
    const params = { [codeStr]: resultData };

    return (
      <Component {...props} {...params} ref={ref} />
    );
  })
}