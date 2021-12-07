import React, { cloneElement, useEffect } from 'react'
import { FormRule } from './form-store';
import { formListPath } from './form';

export interface FormListProps {
  name?: string
  children?: React.ReactNode
  rules?: FormRule[]
  path?: string;
}

export const FormList = React.forwardRef((props: FormListProps, ref) => {
  const {
    name,
    children,
    rules,
    path,
  } = props

  const currentPath = path ? `${path}.${name}` : `${name}`;

  useEffect(() => {
    if (currentPath) {
      formListPath.push(currentPath)
    }
  }, [currentPath]);

  const childs = React.Children.map(children, (child: any, index) => {
    const childRules = (rules || [])?.concat(child?.props?.rules)?.filter((rule) => !!rule);
    return cloneElement(child, {
      name: currentPath ? `${currentPath}.${index}` : '',
      rules: childRules
    });
  });

  return childs;
})

FormList.displayName = 'FormList';
