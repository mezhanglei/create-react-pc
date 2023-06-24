import { isEmpty } from '@/utils/type';
import React, { cloneElement, useContext } from 'react';
import { FormOptionsContext } from './form-context';
import { joinFormPath } from './utils/utils';
import { FormRule } from './validator';

export interface ListCoreProps {
  name?: string;
  rules?: FormRule[];
  initialValue?: any[];
  ignore?: boolean;
  children?: any;
}

export const ListCore = (props: ListCoreProps) => {
  const options = useContext(FormOptionsContext);
  const mergeProps = Object.assign({}, options, props);
  const { children, ...fieldProps } = mergeProps;
  const {
    name,
    rules,
    initialValue,
    ...rest
  } = fieldProps;

  const ignore = rest?.ignore || rest?.readOnly;
  const currentPath = (isEmpty(name) || ignore === true) ? undefined : name;

  // 渲染子元素
  let index = 0;
  const getChildren = (children: any): any => {
    return React.Children.map(children, (child: any) => {
      const nestChildren = child?.props?.children;
      const dataType = child?.props?.['data-type'];
      const childType = child?.type;
      if (nestChildren && (dataType === 'ignore' || typeof childType === 'string')) {
        return cloneElement(child, {
          children: getChildren(nestChildren)
        });
      } else {
        if (React.isValidElement(child)) {
          return renderFormItem(child);
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
    const childValue = child?.props?.initialValue ?? initialValue?.[currentIndex];
    const childname = joinFormPath(currentPath, currentIndex, child?.props?.name);
    return React.isValidElement(child) ? cloneElement(child, {
      name: childname,
      rules: childRules,
      initialValue: childValue
    } as any) : child;
  };

  const childs = getChildren(children);

  return childs
};

ListCore.displayName = 'ListCore';
