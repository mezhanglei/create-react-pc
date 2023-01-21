import React, { useEffect, useState } from 'react';
import request from '@/http/request';
import { objectToFormData } from '@/utils/object';
import { RequestResponseConfig } from './request';

/**
 * 包裹目标之后，会根据requestConfig参数自动请求远程数据并传递给目标控件
 * @param component 目标控件
 * @param requestKey 请求数据源的字段名
 * @returns 
 */

export function bindRequest(component: any, requestKey: string = "options") {
  const Component = component;
  return React.forwardRef((props: { requestConfig?: RequestResponseConfig }, ref) => {
    const {
      requestConfig,
      ...rest
    } = props;

    const [response, setResponse] = useState<unknown>();

    const {
      url,
      method,
      requestType,
      params,
      headers,
      returnFn,
    } = requestConfig || {};

    useEffect(() => {
      getRequest();
    }, []);

    const getRequest = async () => {
      if (method && url) {
        const paramsKey = (method === 'get' || method === 'delete') ? 'params' : 'data';
        const data = requestType === 'formdata' ? objectToFormData(params) : params;
        const result = await request[method]({
          [paramsKey]: data,
          headers,
          url
        });
        const formatRes = typeof returnFn == 'function' ? returnFn(result) : result;
        setResponse(formatRes);
      }
    }

    // 赋值数据
    const requestSet = requestConfig && requestKey && {
      [requestKey]: response
    }

    return (
      <Component {...rest} {...requestSet} ref={ref} />
    );
  })
}