import React, { useContext, CSSProperties, useMemo } from 'react';
import { FormStoreContext, FormOptionsContext } from './form-context';
import { FormStore } from './form-store';
import { useFormError } from './use-form';
import { Item, ItemProps } from './components/item';
import { ItemCore, ItemCoreProps } from './item-core';

export type FormItemProps<T = ItemProps> = T & ItemCoreProps & {
  className?: string;
  children?: React.ReactNode;
  style?: CSSProperties;
  component?: any;
}

export const FormItem = React.forwardRef<any, FormItemProps>((props, ref) => {
  const form = useContext<FormStore>(FormStoreContext)
  const options = useContext<FormItemProps>(FormOptionsContext)
  const mergeProps = Object.assign({}, options, props);
  const { children, ...fieldProps } = mergeProps;
  const {
    name,
    index,
    trigger,
    validateTrigger,
    valueProp,
    valueGetter,
    valueSetter,
    errorClassName,
    onFieldsChange,
    onValuesChange,
    initialValue,
    rules,
    component = Item,
    ...rest
  } = fieldProps;

  const [error] = useFormError(form, name);
  const ignore = rest?.ignore || rest?.readOnly
  const isHaveRequired = useMemo(() => (rules instanceof Array && rules?.find((rule) => rule?.required === true)), [rules]);
  const required = isHaveRequired && ignore !== true ? true : rest?.required;
  const FieldComponent = component;

  const childs = (
    <ItemCore
      ignore={ignore}
      name={name}
      index={index}
      trigger={trigger}
      validateTrigger={validateTrigger}
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
  )

  return (
    FieldComponent ?
      <FieldComponent {...fieldProps} required={required} ref={ref} error={ignore !== true && error}>
        {childs}
      </FieldComponent>
      : childs
  );
});

FormItem.displayName = 'Form.Item';
