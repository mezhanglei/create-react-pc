import React, { cloneElement, useContext } from 'react';
import { FormOptionsContext } from './form-context';
import { joinFormPath, isFormNode } from './utils/utils';
import { FormRule } from './validator';

export interface ListCoreProps {
  name?: string | number;
  parent?: string;
  rules?: FormRule[];
  initialValue?: any[];
  ignore?: boolean;
  children?: any;
}

export const ListCore = (props: ListCoreProps) => {
  const options = useContext(FormOptionsContext);
  const mergeProps = { ...options, ...props };
  const { children, ...fieldProps } = mergeProps;
  const {
    name,
    rules,
    parent,
    initialValue,
    ignore
  } = fieldProps;

  const joinPath = joinFormPath(parent, name);
  const formPath = ignore === true ? parent : joinPath;
  const initialListValue = initialValue;

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
    const childRules = rules instanceof Array ? rules?.concat(child?.props?.rules) : child?.props?.rules;
    const childValue = child?.props?.initialValue ?? initialListValue?.[currentIndex];
    return child && cloneElement(child, {
      parent: formPath,
      name: currentIndex,
      rules: childRules,
      initialValue: childValue
    });
  };

  const childs = getChildren(children);

  return childs
};

ListCore.displayName = 'ListCore';
