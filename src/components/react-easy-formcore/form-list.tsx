import React, { CSSProperties, useContext, useMemo } from 'react';
import { joinFormPath } from './utils/utils';
import { useFormError } from './use-form';
import { Item, ItemProps } from './components/item';
import { ListCore, ListCoreProps } from './list-core';
import { FormStore } from './form-store';
import { FormStoreContext, FormOptionsContext } from './form-context';
import { isEmpty } from '@/utils/type';

export type FormListProps<T = ItemProps> = T & ListCoreProps & {
  className?: string;
  children?: React.ReactNode;
  style?: CSSProperties;
  component?: any;
  ignore?: boolean;
}

export const FormList = React.forwardRef<any, FormListProps>((props, ref) => {
  const store = useContext<FormStore>(FormStoreContext)
  const options = useContext<any>(FormOptionsContext)
  const mergeProps = { ...options, ...props };
  const { children, ...fieldProps } = mergeProps;
  const {
    name,
    rules,
    parent,
    initialValue,
    /** 忽略传递的props */
    index,
    trigger,
    validateTrigger,
    valueProp,
    valueGetter,
    valueSetter,
    errorClassName,
    onFieldsChange,
    onValuesChange,
    component = Item,
    ignore,
    ...rest
  } = fieldProps;

  const currentPath = (isEmpty(name) || ignore) ? undefined : joinFormPath(parent, name);
  const [error] = useFormError(store, currentPath);
  const isHaveRequired = useMemo(() => (rules instanceof Array && rules?.find((rule) => rule?.required === true)), [rules]);
  const required = isHaveRequired && ignore !== true ? true : rest?.required;
  const FieldComponent = component

  const childs = (
    <ListCore
      ignore={ignore}
      name={name}
      parent={parent}
      rules={rules}
      initialValue={initialValue}
    >
      {children}
    </ListCore>
  )

  return (
    FieldComponent ?
      <FieldComponent {...rest} required={required} ref={ref} error={error}>
        {childs}
      </FieldComponent>
      : childs
  );
});

FormList.displayName = 'Form.List';
