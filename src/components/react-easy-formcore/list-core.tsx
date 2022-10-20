import React, { cloneElement, useContext } from 'react';
import { FormValuesContext, FormOptionsContext } from './form-context';
import { getCurrentPath, isFormNode } from './utils/utils';
import { deepGet } from '@/utils/object';
import { FormRule } from './validator';

export interface ListCoreProps {
  name?: string;
  parent?: string;
  rules?: FormRule[];
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
  const initialListValue = initialValue ?? deepGet(initialValues, currentPath);

  // 渲染子元素
  let index = 0;
  const getChildren = (children: any): any => {
    return React.Children.map(children, (child: any) => {
      if (isFormNode(child)) {
        return renderFormItem(child);
      } else {
        const childs = child?.props?.children;
        const dataType = child?.props?.['data-type']; // 标记的需要穿透的外层容器
        const childType = child?.type;
        if (childs && (dataType === 'ignore' || typeof childType === 'string')) {
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
    const childRules = (rules || [])?.concat(child?.props?.rules);
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
