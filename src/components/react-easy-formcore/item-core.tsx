import { AopFactory } from '@/utils/function-aop';
import { isEqual } from '@/utils/object';
import classnames from 'classnames';
import React, { cloneElement, isValidElement, useCallback, useContext, useEffect, useState } from 'react';
import { FormStore } from './form-store';
import { FormStoreContext, FormValuesContext, FormOptionsContext } from './form-context';
import { deepGet, getCurrentPath, getValueFromEvent, getValuePropName } from './utils/utils';
import { FormRule } from './validator';

export interface ItemCoreProps {
  name?: string;
  parent?: string;
  index?: number;
  valueProp?: string | ((type: any) => string);
  valueGetter?: ((...args: any[]) => any);
  valueSetter?: ((value: any) => any);
  rules?: FormRule[];
  initialValue?: any;
  errorClassName?: string;
  onFieldsChange?: (obj: { parent: string, name?: string, value: any }) => void;
  onValuesChange?: (obj: { parent?: string, name?: string, value: any }) => void;
  children?: any
}

export const ItemCore = (props: ItemCoreProps) => {
  const store = useContext<FormStore>(FormStoreContext)
  const initialValues = useContext(FormValuesContext)
  const options = useContext(FormOptionsContext)
  const mergeProps = { ...options, ...props };
  const { children, ...fieldProps } = mergeProps;
  const {
    name,
    valueProp = 'value',
    valueGetter = getValueFromEvent,
    valueSetter,
    parent,
    errorClassName,
    onFieldsChange,
    onValuesChange,
    initialValue
  } = fieldProps;

  const currentPath = getCurrentPath(name, parent);
  const initialItemValue = initialValue ?? deepGet(initialValues, currentPath);
  const storeValue = currentPath && store?.getFieldValue(currentPath);
  const [value, setValue] = useState(storeValue);

  // 初始化获取初始props
  currentPath && store?.setFieldProps(currentPath, fieldProps);

  // 给子元素绑定的onChange
  const onChange = useCallback(
    (...args: any[]) => {
      const value = valueGetter(...args);
      if (currentPath && store) {
        // 设置值
        store.setFieldValue(currentPath, value);
        // 主动onchange事件
        onFieldsChange && onFieldsChange({ parent: parent, name: name, value: value });
      }
    },
    [currentPath, store, valueGetter, onFieldsChange]
  );

  const aopOnchange = new AopFactory(onChange);

  // 回填storeValue
  useEffect(() => {
    if (!isEqual(storeValue, value)) {
      setValue(storeValue);
    }
  }, [storeValue])

  // 订阅更新值的函数
  useEffect(() => {
    if (!currentPath || !store) return
    // 订阅目标控件
    const uninstall = store.subscribeFormItem(currentPath, (newValue, oldValue) => {
      setValue(newValue);
      if (!isEqual(newValue, oldValue)) {
        onValuesChange && onValuesChange({ parent: parent, name: name, value: newValue })
      }
    });
    return () => {
      uninstall();
    };
  }, [currentPath, store, onValuesChange]);

  // 表单域初始化值
  useEffect(() => {
    if (!currentPath || !store) return;
    // 回填store.initialValues和回填store.values
    if (initialItemValue !== undefined) {
      store.setInitialValues(currentPath, initialItemValue);
    }
    return () => {
      // 清除该表单域的props(在设置值的前面)
      currentPath && store?.setFieldProps(currentPath, undefined);
      // 清除初始值
      currentPath && store.setInitialValues(currentPath, undefined);
    }
  }, [currentPath]);

  const childValue = (value: any) => {
    if (typeof valueSetter === 'function') {
      return valueSetter(value);
    } else {
      return value;
    }
  }
  // 最底层才会绑定value和onChange
  const bindChild = (child: any) => {
    if (currentPath && isValidElement(child)) {
      const valuePropName = getValuePropName(valueProp, child && child.type);
      const childProps = child?.props as any;
      const { onChange, className } = childProps || {};
      // 对onChange方法进行aop包装，在后面添加子元素自身的onChange事件
      const aopAfterFn = aopOnchange.addAfter(onChange);
      const valueResult = childValue(value);
      const newChildProps = { className: classnames(className, errorClassName), [valuePropName]: valueResult, onChange: aopAfterFn }
      return cloneElement(child, newChildProps)
    } else {
      return child;
    }
  };

  // 是否为表单节点
  const isFormNode = (child: any) => {
    const displayName = child?.type?.displayName;
    const formFields = ['Form.Item', 'Form.List','ListCore', 'ItemCore'];
    const dataName = child?.props?.['data-name']; // 忽略当前节点
    return formFields?.includes(displayName) && dataName !== 'ignore'
  };

  // 渲染子元素
  const getChildren = (children: any): any => {
    return React.Children.map(children, (child: any) => {
      if (isFormNode(child)) {
        return cloneElement(child, {
          parent: currentPath
        });
      } else {
        const childs = child?.props?.children;
        const dataType = child?.props?.['data-type']; // 标记的需要穿透的外层容器
        const dataName = child?.props?.['data-name']; // 标记的符合value/onChange props的控件
        const childType = child?.type;
        if (childs && (dataType === 'ignore' || typeof childType === 'string') && !dataName) {
          return cloneElement(child, {
            children: getChildren(childs)
          });
        } else {
          return bindChild(child);
        }
      }
    });
  };

  const childs = getChildren(children);

  return <>{childs}</>;
};

ItemCore.displayName = "ItemCore";
