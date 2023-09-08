import React, { useEffect, useState } from 'react';
import request from '@/http/request';
import { objectToFormData } from '@/utils/object';
import { RequestResponseConfig } from './request';

/**
 * 自动给目标组件某个数据来源绑定请求，默认该数据的字段为options
 * @param component 目标控件
 * @param codeStr 请求数据源的字段名
 * @returns 
 */

export function bindRequest(component: any, codeStr: string = "options") {
  const Component = component;
  return React.forwardRef<any, { requestConfig?: RequestResponseConfig }>((props, ref) => {
    const {
      requestConfig,
      ...rest
    } = props;

    const [response, setResponse] = useState<unknown>();

    const {
      url,
      method,
      paramsType,
      params,
      headers,
      returnFn,
    } = requestConfig || {};

    useEffect(() => {
      getRequest();
    }, []);

    const getRequest = async () => {
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

    const requestParams = requestConfig?.url && codeStr ? { [codeStr]: response } : {};

    return (
      <Component {...rest} {...requestParams} ref={ref} />
    );
  })
}