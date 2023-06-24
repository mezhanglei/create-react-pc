import React, { CSSProperties, useContext, useMemo } from 'react';
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
  ignore?: boolean;
}

export const FormList = React.forwardRef<any, FormListProps>((props, ref) => {
  const form = useContext<FormStore>(FormStoreContext)
  const options = useContext<any>(FormOptionsContext)
  const mergeProps = Object.assign({}, options, props);
  const { children, ...fieldProps } = mergeProps;
  const {
    name,
    rules,
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
    ...rest
  } = fieldProps;

  const [error] = useFormError(form, name);
  const ignore = rest?.ignore || rest?.readOnly;
  const isHaveRequired = useMemo(() => (rules instanceof Array && rules?.find((rule) => rule?.required === true)), [rules]);
  const required = isHaveRequired && ignore !== true ? true : rest?.required;
  const FieldComponent = component

  const childs = (
    <ListCore
      ignore={ignore}
      name={name}
      rules={rules}
      initialValue={initialValue}
    >
      {children}
    </ListCore>
  )

  return (
    FieldComponent ?
      <FieldComponent {...fieldProps} required={required} ref={ref} error={ignore !== true && error}>
        {childs}
      </FieldComponent>
      : childs
  );
});

FormList.displayName = 'Form.List';
