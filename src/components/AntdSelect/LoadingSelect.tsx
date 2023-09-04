import request from '@/http/request';
import React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { BaseSelectProps } from './BaseSelect';
import BaseSelect from './BaseSelect';

/**
 * 下拉组件(支持搜索和下拉加载请求)
 */
interface LoadingSelectProps extends BaseSelectProps {
  url?: string; // 请求的路径, 没有请求路径则为普通下拉框
  type?: 'post' | 'get' | 'put' | 'delete'; // 请求的类型
  params?: any; // 请求的参数
  searchCode?: string; // 搜索时关键字参数字符串
  handleSuccess?: (res?: unknown) => Array<unknown>; // 请求中获取options
  immediate?: boolean; // 是否立即请求
  disabledSearch?: boolean; // 禁止搜索
}
const LoadingSelect: React.FC<LoadingSelectProps> = props => {
  const {
    params,
    searchCode,
    onClear,
    url,
    type = 'post',
    handleSuccess,
    onDropdownVisibleChange,
    immediate = true,
    disabledSearch,
    ...rest
  } = props;

  const [options, setOptions] = useState<Array<any>>();
  const [loading, setLoading] = useState<boolean>();
  const debounceRef = useRef<any>(); // 用作防抖

  // 根据关键词搜索结果
  const fecthData = (keywords?: string | number) => {
    if (!url) return;
    // 执行请求
    const handleRequest = () => {
      setLoading(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const newParams = searchCode ? Object.assign({ [searchCode]: keywords }, params) : params;
          const result = await request[type](url, newParams || {});
          const list = handleSuccess && handleSuccess(result);
          setOptions(list || []);
          setLoading(false);
        } catch (error) {
          setLoading(false);
        }
      }, 500);
    };

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      handleRequest();
    } else {
      handleRequest();
    }
  };

  useEffect(() => {
    if (immediate) {
      fecthData()
    }
  }, [JSON.stringify(params), url, immediate]);

  // 搜索时的请求(防抖)
  const onSearchHandle = async (keywords?: string) => {
    if (!disabledSearch) {
      fecthData(keywords);
    }
  };

  const onClearHandle = () => {
    fecthData();
    onClear && onClear();
  };

  const handleDropdown = (visible: boolean) => {
    if (visible) {
      fecthData();
    }
    onDropdownVisibleChange && onDropdownVisibleChange(visible);
  };

  return (
    <BaseSelect
      options={options}
      hasMore={false}
      loading={loading}
      onSearch={onSearchHandle}
      onClear={onClearHandle}
      onDropdownVisibleChange={handleDropdown}
      {...rest}
    />
  );
};

export default LoadingSelect;
