import classnames from 'classnames';
import React, { cloneElement, isValidElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { FormStore } from './form-store';
import { FormStoreContext, FormInitialValuesContext, FormOptionsContext, FormValuesContext } from './form-context';
import { deepGet, getValueFromEvent, getValuePropName, toArray } from './utils/utils';
import { FormRule } from './validator';
import { isEmpty } from '@/utils/type';

export type TriggerType = string;
export interface FieldChangedParams {
  name?: string;
  value: any;
}

export interface ItemCoreProps {
  name?: string;
  ignore?: boolean;
  index?: number;
  trigger?: TriggerType | TriggerType[]; // 设置收集字段值变更的时机
  validateTrigger?: TriggerType | TriggerType[];
  valueProp?: string | ((type: any) => string);
  valueGetter?: ((...args: any[]) => any);
  valueSetter?: ((value: any) => any);
  rules?: FormRule[];
  initialValue?: any;
  errorClassName?: string;
  onFieldsChange?: (obj: FieldChangedParams, values?: any) => void;
  onValuesChange?: (obj: FieldChangedParams, values?: any) => void;
  children?: any
}

export const ItemCore = (props: ItemCoreProps) => {
  const form = useContext<FormStore>(FormStoreContext);
  const initialValues = useContext(FormInitialValuesContext);
  const contextValues = useContext(FormValuesContext);
  const options = useContext(FormOptionsContext);
  const mergeProps = Object.assign({}, options, props);
  const { children, ...fieldProps } = mergeProps;
  const {
    name,
    valueProp = 'value',
    valueGetter = getValueFromEvent,
    valueSetter,
    errorClassName,
    onFieldsChange,
    onValuesChange,
    initialValue,
    trigger = 'onChange',
    validateTrigger,
    ...rest
  } = fieldProps;

  const ignore = rest?.ignore || rest?.readOnly;
  const currentPath = (isEmpty(name) || ignore === true) ? undefined : name;
  const contextValue = deepGet(contextValues, currentPath);
  const initValue = initialValue ?? deepGet(initialValues, currentPath);
  const storeValue = form && form.getFieldValue(currentPath);
  const initialItemValue = contextValue ?? storeValue ?? initValue;
  const [value, setValue] = useState(initialItemValue);

  useEffect(() => {
    setValue(contextValue);
  }, [contextValue]);

  // 初始化获取初始props
  currentPath && form?.setFieldProps(currentPath, fieldProps);

  // 收集的rules中的validateTrigger
  const ruleTriggers = useMemo(() => {
    const rules = fieldProps?.['rules'];
    const result = []
    if (rules instanceof Array) {
      for (let i = 0; i < rules?.length; i++) {
        const rule = rules?.[i];
        if (rule?.validateTrigger) {
          result.push(rule?.validateTrigger)
        }
      }
    }
    return result;
  }, [fieldProps?.['rules']]);

  // 可触发事件列表
  const triggers = useMemo(() => new Set<string>([
    ...toArray(trigger),
    ...toArray(validateTrigger),
    ...ruleTriggers
  ]), [trigger, validateTrigger, ruleTriggers]);

  // 给子元素绑定的onChange
  const bindChange = useCallback(
    (eventName, ...args: any[]) => {
      const newValue = valueGetter(...args);
      if (currentPath && form) {
        // 设置值
        form.setFieldValue(currentPath, newValue, eventName);
        // 主动onchange事件
        onFieldsChange && onFieldsChange({ name: currentPath, value: newValue }, form?.getFieldValue());
      }
    },
    [currentPath, form, valueGetter, onFieldsChange]
  );

  // 订阅更新值的函数
  useEffect(() => {
    if (!currentPath || !form) return
    // 订阅目标控件
    const uninstall = form.subscribeFormItem(currentPath, (newValue, oldValue) => {
      setValue(newValue);
      if (!(isEmpty(newValue) && isEmpty(oldValue))) {
        onValuesChange && onValuesChange({ name: currentPath, value: newValue }, form?.getFieldValue())
      }
    });
    return () => {
      uninstall();
    };
  }, [currentPath, form, onValuesChange]);

  // 表单域初始化值
  useEffect(() => {
    if (!currentPath || !form) return;
    // 回填form.initialValues和回填form.values
    if (initialItemValue !== undefined) {
      form.setInitialValues(currentPath, initialItemValue);
    }
    return () => {
      // 清除该表单域的props(在设置值的前面)
      currentPath && form?.setFieldProps(currentPath, undefined);
      // 清除初始值
      currentPath && form.setInitialValues(currentPath, undefined);
    }
  }, [currentPath]);

  const childValue = useMemo(() => typeof valueSetter === 'function' ? valueSetter(value) : value, [valueSetter, value]);

  // 控件绑定value和onChange
  const bindChild = (child: any) => {
    if (!isEmpty(currentPath) && isValidElement(child)) {
      const valuePropName = getValuePropName(valueProp, child && child.type);
      const childProps = child?.props as any;
      const { className } = childProps || {};
      const valueResult = childValue;
      const newChildProps = { className: classnames(className, errorClassName), [valuePropName]: valueResult }

      triggers.forEach((eventName) => {
        newChildProps[eventName] = (...args: any[]) => {
          bindChange?.(eventName, ...args);
          childProps[eventName]?.(...args);
        };
      });

      return cloneElement(child, newChildProps)
    } else {
      return child;
    }
  };

  // 遍历子组件绑定控件
  const getChildren = (children: any): any => {
    return React.Children.map(children, (child: any) => {
      const nestChildren = child?.props?.children;
      const dataType = child?.props?.['data-type']; // 标记的需要穿透的外层容器
      const dataName = child?.props?.['data-name']; // 标记的符合value/onChange props的控件
      const childType = child?.type;
      if (nestChildren && (dataType === 'ignore' || typeof childType === 'string') && !dataName) {
        return cloneElement(child, {
          children: getChildren(nestChildren)
        });
      } else {
        return bindChild(child);
      }
    });
  };

  const childs = getChildren(children);

  return childs;
};

ItemCore.displayName = "ItemCore";
