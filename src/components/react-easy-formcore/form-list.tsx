import React, { CSSProperties, useContext } from 'react';
import { getCurrentPath } from './utils/utils';
import { useFormError } from './use-form';
import { Item, ItemProps } from './components/item';
import { ListCore, ListCoreProps } from './list-core';
import { FormStore } from './form-store';
import { FormStoreContext, FormOptionsContext } from './form-context';

export type FormListProps<T = ItemProps> = T & ListCoreProps & {
  className?: string;
  children?: React.ReactNode;
  style?: CSSProperties;
  component?: any;
  readOnly?: boolean;
}

export const FormList = React.forwardRef((props: FormListProps, ref: any) => {
  const store = useContext<FormStore>(FormStoreContext)
  const options = useContext(FormOptionsContext);
  const mergeProps = { ...options, ...props };
  const { children, ...fieldProps } = mergeProps;
  const {
    name,
    rules,
    parent,
    initialValue,
    /** 忽略传递的props */
    valueProp,
    valueGetter,
    valueSetter,
    errorClassName,
    onFieldsChange,
    onValuesChange,
    component = Item,
    readOnly,
    ...rest
  } = fieldProps;

  const currentPath = getCurrentPath(name, parent);
  const [error] = useFormError(store, currentPath);
  const FieldComponent = component

  return (
    <FieldComponent {...rest} ref={ref} error={error}>
      {
        readOnly ?
          children
          :
          <ListCore
            name={name}
            parent={parent}
            rules={rules}
            initialValue={initialValue}
          >
            {children}
          </ListCore>
      }
    </FieldComponent>
  );
});

FormList.displayName = 'Form.List';
