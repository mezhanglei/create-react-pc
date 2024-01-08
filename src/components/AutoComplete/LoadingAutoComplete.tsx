import request from '@/http';
import { AutoComplete, AutoCompleteProps } from 'antd';
import React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * 支持请求的AutoComplete组件
 */
interface LoadingAutoCompleteProps extends AutoCompleteProps {
  url?: string; // 请求的路径, 没有请求路径则为普通下拉框
  type?: 'post' | 'get' | 'put' | 'delete'; // 请求的类型
  params?: any; // 请求的参数
  valueCode?: string; // 选项的值的字段
  labelCode?: string; // 选项的展示字段
  searchCode?: string; // 搜索时关键字参数字符串
  immediate?: boolean; // 是否立即请求
  handleSuccess?: (res?: unknown) => Array<unknown>; // 请求中获取options
  onChange?: (val: string, item: unknown) => void; // 改造后的onChange函数
  onSelect?: (val: string, item: unknown) => void; // 改造后的onSelect函数
}
const LoadingAutoComplete: React.FC<LoadingAutoCompleteProps> = props => {
  const {
    type = 'post',
    url,
    params,
    searchCode = 'label',
    valueCode = 'value',
    labelCode = 'label',
    value,
    immediate = true,
    onChange,
    onSelect,
    onClear,
    handleSuccess,
    onDropdownVisibleChange,
    ...rest
  } = props;

  const [options, setOptions] = useState<Array<any>>();
  const [loading, setLoading] = useState<boolean>();
  const debounceRef = useRef<any>(); // 用作防抖

  useEffect(() => {
    if (immediate) {
      fecthData();
    }
  }, [JSON.stringify(params), url, immediate]);

  const setFormatOptions = (options: Array<any>) => {
    let result: Array<{ label: string; value: string | number }> = [];
    if (options instanceof Array) {
      result = options.map((option) => ({ ...option, label: option[labelCode], value: option[valueCode], }));
    }
    setOptions(result);
  };

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
          setFormatOptions(list || []);
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

  // 搜索时的请求(防抖)
  const onSearchHandle = async (keywords?: string) => {
    fecthData(keywords);
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

  const onChangeHandle = (value: string) => {
    const item = options?.find?.((data: any) => data?.[valueCode] == value);
    onChange && onChange(value, item);
  };

  const onSelectHandle = (value: string) => {
    const item = options?.find?.((data: any) => data?.[valueCode] == value);
    onSelect && onSelect(value, item);
  };

  const transformValue = useMemo(() => {
    const item = options?.find?.((data: any) => data?.[valueCode] == value);
    if (item) {
      return item[labelCode];
    }
  }, [value, JSON.stringify(options)]);

  return (
    <AutoComplete
      allowClear
      value={transformValue}
      onSearch={onSearchHandle}
      options={options}
      onDropdownVisibleChange={handleDropdown}
      onChange={onChangeHandle}
      onSelect={onSelectHandle}
      onClear={onClearHandle}
      {...rest}
    />
  );
};

export default LoadingAutoComplete;
