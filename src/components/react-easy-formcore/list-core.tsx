import React, { cloneElement, useContext } from 'react';
import { FormOptionsContext } from './form-options-context';
import { FormValuesContext } from './form-store-context';
import { getCurrentPath } from './utils/utils';
import { deepGet } from '@/utils/object';
import { FormRule } from './validator';

export interface ListCoreProps {
  name?: string;
  rules?: FormRule[];
  parent?: string;
  initialValue?: any[];
  children?: any;
}

export const ListCore = (props: ListCoreProps) => {
  const options = useContext(FormOptionsContext);
  const initialValues = useContext(FormValuesContext);
  const mergeProps = { ...options, ...props };
  const { children, ...fieldProps } = mergeProps;
  const {
    name,
    rules,
    parent,
    initialValue,
  } = fieldProps;

  const currentPath = getCurrentPath(name, parent);
  const initialListValue = initialValue ?? (currentPath && deepGet(initialValues, currentPath));

  // 是否为表单控件
  const isFormField = (child: any) => {
    const displayName = child?.type?.displayName;
    const formFields = ['Form.Item', 'Form.List','ListCore', 'ItemCore'];
    return formFields?.includes(displayName);
  };

  // 渲染子元素
  let index = 0;
  const getChildren = (children: any): any => {
    return React.Children.map(children, (child: any) => {
      if (isFormField(child)) {
        return renderFormItem(child);
      } else {
        const childs = child?.props?.children;
        if (childs && child !== undefined) {
          return cloneElement(child, {
            children: getChildren(childs)
          });
        } else {
          return child;
        }
      }
    });
  };

  // 渲染子项
  const renderFormItem = (child: any) => {
    const currentIndex = index;
    index++;
    const childRules = (rules || [])?.concat(child?.props?.rules)?.filter((rule: FormRule) => !!rule);
    const childValue = child?.props?.initialValue ?? initialListValue?.[currentIndex];
    return child && cloneElement(child, {
      parent: currentPath,
      name: `[${currentIndex}]`,
      rules: childRules,
      initialValue: childValue
    });
  };

  const childs = getChildren(children);

  return childs
};

ListCore.displayName = 'ListCore';
