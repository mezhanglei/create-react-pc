import React, { cloneElement, CSSProperties, useContext, useEffect } from 'react'
import { FormRule } from './form-store';
import classnames from 'classnames';
import { FormOptions, FormOptionsContext } from './form-options-context';
import { FormStoreContext, FormValuesContext } from './form-store-context';

export interface FormListProps extends FormOptions {
  label?: string;
  suffix?: React.ReactNode;
  name?: string;
  rules?: FormRule[];
  path?: string;
  initialValue?: any[];
  className?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
}

const prefixCls = 'rh-form-list';
export const classes_list = {
  list: prefixCls,
  inline: `${prefixCls}--inline`,
  compact: `${prefixCls}--compact`,
  required: `${prefixCls}--required`,
  error: `${prefixCls}--error`,

  header: `${prefixCls}__header`,
  container: `${prefixCls}__container`,
  control: `${prefixCls}__control`,
  message: `${prefixCls}__message`,
  footer: `${prefixCls}__footer`,
}

export const FormList = React.forwardRef((props: FormListProps, ref: any) => {
  // const store = useContext(FormStoreContext)
  const options = useContext(FormOptionsContext)
  const initialValues = useContext(FormValuesContext)
  const finalProps = { ...options, ...props };
  const { children, ...fieldProps } = finalProps;
  const {
    name,
    rules,
    path,
    label,
    suffix,
    className,
    style,
    inline,
    compact,
    required,
    labelWidth,
    labelAlign,
    gutter
  } = fieldProps

  const currentPath = path ? `${path}.${name}` : `${name}`;
  const initialValue = initialValues?.[currentPath as string] ?? fieldProps?.initialValue;

  const childs = React.Children.map(children, (child: any, index) => {
    const childRules = (rules || [])?.concat(child?.props?.rules)?.filter((rule) => !!rule);
    const childValue = child?.props?.initialValue ?? initialValue?.[index];
    return child && cloneElement(child, {
      path: currentPath,
      name: `[${index}]`,
      rules: childRules,
      initialValue: childValue
    });
  });

  const cls = classnames(
    classes_list.list,
    inline ? classes_list.inline : '',
    compact ? classes_list.compact : '',
    required ? classes_list.required : '',
    className ? className : ''
  )

  const headerStyle = {
    width: labelWidth,
    marginRight: gutter,
    textAlign: labelAlign
  }

  return (
    <div ref={ref} className={cls} style={style}>
      {label !== undefined && (
        <div className={classes_list.header} style={headerStyle}>
          {label}
        </div>
      )}
      <div className={classes_list.container}>
        {childs}
      </div>
      {suffix !== undefined && <div className={classes_list.footer}>{suffix}</div>}
    </div>
  )
});

FormList.displayName = 'FormList';
