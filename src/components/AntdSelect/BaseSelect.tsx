import React from 'react';
import type { SelectProps } from 'antd';
import { Select, Tooltip } from 'antd';
import type { ReactNode, UIEventHandler } from 'react';
import { useEffect, useState } from 'react';
import classNames from 'classnames';
import styles from './BaseSelect.module.less';

/**
 * 底层select框组件(未封装请求的底层组件)
 */
export interface BaseSelectProps extends SelectProps {
  isShowKv?: boolean; // 回显到框中是否展示${valueCode}-${optionLabelProp}这种形式的字符串
  valueCode?: string; // 选项的值的字段
  labelCode?: string; // 选项的展示字段
  renderLabel?: (option: unknown) => React.ReactNode; // 渲染label
  subLabelCode?: string; // 选项展示的次要字段
  renderSubLabel?: (option: unknown) => React.ReactNode; // 渲染label
  hasMore?: boolean; // 是否可以加载下个滚动请求
  next?: () => Promise<any>; // 被加载的请求函数
  onChange?: (val: string, item: unknown) => void; // 改造后的onChange函数
  onSelect?: (val: string, item: unknown) => void; // 改造后的onSelect函数
}
const BaseSelect: React.FC<BaseSelectProps> = props => {
  const {
    valueCode = 'value',
    labelCode = 'label',
    renderLabel,
    subLabelCode,
    renderSubLabel,
    hasMore,
    next,
    mode,
    options,
    className,
    optionLabelProp,
    onChange,
    onSelect,
    onSearch,
    isShowKv,
    ...rest
  } = props;

  const [loadingMore, setLoadingMore] = useState<boolean>();
  const changedLabelCode = 'inputLable';

  const renderOption = (label?: ReactNode, subLabel?: ReactNode, toolTip?: string) => {
    return (
      <div>
        <Tooltip title={toolTip}>
          <div>{label}</div>
          <div>{subLabel}</div>
        </Tooltip>
      </div>
    )
  };

  const formatOptions = options?.map(option => {
    const label = typeof renderLabel === 'function' ? renderLabel(option) : option[labelCode];
    const subLabel = typeof renderSubLabel === 'function' ? renderSubLabel(option) : subLabelCode && option[subLabelCode];
    const customLabelNode = renderOption(label, subLabel, option[labelCode]); // 下拉展示选项
    const inputLabelCode = optionLabelProp || labelCode;
    return {
      ...option,
      // 因为自定义渲染option需要改变原来的label字段，那么需要再设置一个字段来展示回填
      [changedLabelCode]: isShowKv ? `${option[valueCode]}-${option[inputLabelCode]}` : option?.[inputLabelCode],
      label: customLabelNode,
      value: option[valueCode],
      key: option[valueCode],
    }
  });

  // 加载请求完成
  useEffect(() => {
    setLoadingMore(false);
  }, [options?.length]);

  // 是否在底部
  const isBottom = (dom: HTMLElement) => {
    const offsetHeight = dom?.offsetHeight;
    const scrollTop = dom?.scrollTop;
    return scrollTop + offsetHeight >= dom?.scrollHeight - 50;
  };

  // 滚动加载下个请求
  const onPopupScrollHandle: UIEventHandler<HTMLDivElement> = async e => {
    const target = e?.target as HTMLElement;
    if (!target || loadingMore) return;
    if (isBottom(target) && hasMore) {
      setLoadingMore(true);
      try {
        if (next) {
          await next();
        }
      } catch (error) {
        console.log('🚀 ~ file: index.tsx ~ line 171 ~ getOptionListByPage ~ error', error);
      } finally {
        setLoadingMore(false);
      }
    }
  };

  // 多选模式下，设置隐藏tag时的默认样式
  const maxTagPlaceholderRender = (omittedValues: Array<any>) => {
    return (
      <Tooltip placement="topLeft" title={omittedValues?.map(e => e?.label)?.join('；')}>
        <span>+ {omittedValues?.length} ...</span>
      </Tooltip>
    );
  };

  const onChangeHandle = (value: string) => {
    const item = options?.find?.((data: any) => data?.[valueCode] == value);
    onChange && onChange(value, item);
  };

  const onSelectHandle = (value: string) => {
    const item = options?.find?.((data: any) => data?.[valueCode] == value);
    onSelect && onSelect(value, item);
  };

  const onSearchHandle = (val: string) => {
    onSearch && onSearch(val);
  };

  return (
    <Select
      className={classNames(styles.customerSelect, className)}
      showSearch
      allowClear
      showArrow
      loading={loadingMore}
      dropdownMatchSelectWidth={false}
      maxTagCount={mode == 'multiple' || mode == 'tags' ? ('responsive' as const) : undefined}
      maxTagPlaceholder={mode == 'multiple' || mode == 'tags' ? maxTagPlaceholderRender : undefined}
      onPopupScroll={onPopupScrollHandle}
      options={formatOptions}
      mode={mode}
      onChange={onChangeHandle}
      onSelect={onSelectHandle}
      optionLabelProp={optionLabelProp === 'label' ? changedLabelCode : optionLabelProp}
      filterOption={(inputValue, option) => {
        return (
          option?.[changedLabelCode]?.includes(inputValue?.trim()) ||
          option?.value?.toString()?.includes(inputValue?.trim())
        );
      }}
      // getPopupContainer={
      //   (trigger) => {
      //     return trigger.parentNode;
      //   }
      // }
      onSearch={onSearchHandle}
      {...rest}
    />
  );
};

export default BaseSelect;
