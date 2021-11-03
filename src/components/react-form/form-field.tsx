import React, { cloneElement, isValidElement, useCallback, useContext, useState } from 'react'

import { FormStoreContext } from './form-store-context'
import { useFieldChange } from './use-field-change'
import { FormOptions, FormOptionsContext } from './form-options-context'
import { getPropValueName, getValueFromEvent } from './utils'
import { FormRule } from './form-store'
import classnames from 'classnames';

export interface FormFieldProps extends FormOptions {
  className?: string
  label?: string
  name?: string
  valueProp?: string | ((type: any) => string)
  valueGetter?: (...args: any[]) => any
  suffix?: React.ReactNode
  children?: React.ReactNode
  rules?: FormRule[]
}

const prefixCls = 'rh-form-field';

export function FormField(props: FormFieldProps) {
  const {
    className,
    label,
    name,
    valueProp = 'value',
    valueGetter = getValueFromEvent,
    suffix,
    children,
    rules,
    ...restProps
  } = props

  const store = useContext(FormStoreContext)
  const options = useContext(FormOptionsContext)
  const [value, setValue] = useState(name && store ? store.getFieldValue(name) : undefined)
  const [error, setError] = useState(name && store ? store.getFieldError(name) : undefined)

  // onChange监听
  const onChange = useCallback(
    (...args: any[]) => {
      return name && store && store.setFieldValue(name, valueGetter(...args))
    },
    [name, store, valueGetter]
  )

  useFieldChange({
    store,
    name,
    rules,
    // 监听onChange事件
    onChange: () => {
      setValue(store!.getFieldValue(name!))
      setError(store!.getFieldError(name!))
    }
  })

  const { inline, compact, required, labelWidth, gutter, errorClassName = 'error' } = {
    ...options,
    ...restProps
  }

  let child: any = children

  if (name && store && isValidElement(child)) {
    const valueKey = getPropValueName(valueProp, child && child.type)
    const oldProps = child?.props as any;

    let childClassName = oldProps.className || '';
    if (error) childClassName += ' ' + errorClassName


    const newChildProps = { className: childClassName, [valueKey]: value, onChange: oldProps?.onChange || onChange }
    child = cloneElement(child, newChildProps)
  }

  const cls = classnames(
    classes.field,
    inline ? classes.inline : '',
    compact ? classes.compact : '',
    required ? classes.required : '',
    error ? classes.error : '',
    className ? className : ''
  )

  const headerStyle = {
    width: labelWidth,
    marginRight: gutter
  }

  return (
    <div className={cls}>
      {label !== undefined && (
        <div className={classes.header} style={headerStyle}>
          {label}
        </div>
      )}
      <div className={classnames(classes.container, error && classes.containerError)}>
        <div className={classes.control}>{child}</div>
        <div className={classes.message}>{error}</div>
      </div>
      {suffix !== undefined && <div className={classes.footer}>{suffix}</div>}
    </div>
  )
}

const classes = {
  field: prefixCls,
  inline: `${prefixCls}--inline`,
  compact: `${prefixCls}--compact`,
  required: `${prefixCls}--required`,
  error: `${prefixCls}--error`,

  header: `${prefixCls}__header`,
  container: `${prefixCls}__container`,
  containerError: `${prefixCls}__container__error`,
  control: `${prefixCls}__control`,
  message: `${prefixCls}__message`,
  footer: `${prefixCls}__footer`
}
