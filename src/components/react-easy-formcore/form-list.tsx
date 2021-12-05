import React, { cloneElement, isValidElement, useCallback, useContext, useState, CSSProperties, useEffect } from 'react'

import { FormStoreContext } from './form-store-context'
import { useFieldChange } from './use-field-change'
import { FormOptions, FormOptionsContext } from './form-options-context'
import { getPropValueName, getValueFromEvent } from './utils'
import { FormRule } from './form-store'
import classnames from 'classnames';
import { ArrayPath } from './form'

export interface FormListProps extends FormOptions {
  className?: string
  label?: string
  name?: string
  suffix?: React.ReactNode
  children?: React.ReactNode
  rules?: FormRule[]
  style?: CSSProperties
  path?: string;
}

const prefixCls = 'rh-form-list';

export const FormList = React.forwardRef((props: FormListProps, ref) => {
  const {
    className,
    label,
    name,
    suffix,
    children,
    rules,
    style,
    path,
    ...restProps
  } = props

  const currentPath = path ? `${path}.${name}` : `${name}`;
  const options = useContext(FormOptionsContext);

  const { inline, compact, required, labelWidth, labelAlign, gutter } = {
    ...options,
    ...restProps
  }

  useEffect(() => {
    if(currentPath) {
      ArrayPath.push(currentPath)
    }
  }, [currentPath]);

  const FormItems = React.Children.map(children, (child: any, index) => {
    const childDisplayName = child?.type?.displayName;

    if (childDisplayName === 'FormItem' && name) {
      return cloneElement(child, {
        name: `${currentPath}.${index}`
      });
    } else {
      return child;
    }
  });

  const cls = classnames(
    classes.list,
    inline ? classes.inline : '',
    compact ? classes.compact : '',
    required ? classes.required : '',
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
        <div className={classes.header} style={headerStyle}>
          {label}
        </div>
      )}
      <div className={classes.container}>
        <div className={classes.control}>{FormItems}</div>
      </div>
      {suffix !== undefined && <div className={classes.footer}>{suffix}</div>}
    </div>
  )
})

FormList.displayName = 'FormList';

const classes = {
  list: prefixCls,
  inline: `${prefixCls}--inline`,
  compact: `${prefixCls}--compact`,
  required: `${prefixCls}--required`,
  error: `${prefixCls}--error`,

  header: `${prefixCls}__header`,
  container: `${prefixCls}__container`,
  control: `${prefixCls}__control`,
  message: `${prefixCls}__message`,
  footer: `${prefixCls}__footer`
}
