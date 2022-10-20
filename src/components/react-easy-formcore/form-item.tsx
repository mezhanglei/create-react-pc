import React, { useContext, CSSProperties } from 'react';
import { FormStoreContext, FormOptionsContext } from './form-context';
import { getCurrentPath } from './utils/utils';
import { FormStore } from './form-store';
import { useFormError } from './use-form';
import { Item, ItemProps } from './components/item';
import { ItemCore, ItemCoreProps } from './item-core';

export type FormItemProps<T = ItemProps> = T & ItemCoreProps & {
  className?: string;
  children?: React.ReactNode;
  style?: CSSProperties;
  component?: any;
  ignore?: boolean;
}

export const FormItem = React.forwardRef((props: FormItemProps, ref: any) => {
  const store = useContext<FormStore>(FormStoreContext)
  const options = useContext<FormItemProps>(FormOptionsContext)
  const mergeProps = { ...options, ...props };
  const { children, ...fieldProps } = mergeProps;
  const {
    name,
    parent,
    index,
    valueProp,
    valueGetter,
    valueSetter,
    errorClassName,
    onFieldsChange,
    onValuesChange,
    initialValue,
    rules,
    component = Item,
    ignore,
    ...rest
  } = fieldProps;

  const currentPath = getCurrentPath(name, parent);
  const [error] = useFormError(store, currentPath);
  const FieldComponent = component

  return (
    <FieldComponent {...rest} ref={ref} error={error}>
      <ItemCore
        name={ignore ? undefined : name}
        parent={parent}
        index={index}
        valueProp={valueProp}
        valueGetter={valueGetter}
        valueSetter={valueSetter}
        rules={rules}
        initialValue={initialValue}
        errorClassName={errorClassName}
        onFieldsChange={onFieldsChange}
        onValuesChange={onValuesChange}
      >
        {children}
      </ItemCore>
    </FieldComponent>
  );
});

FormItem.displayName = 'Form.Item';
