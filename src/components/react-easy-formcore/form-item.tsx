import React, { cloneElement, isValidElement, useCallback, useContext, useState } from 'react'

import { FormStoreContext } from './form-store-context'
import { useFieldChange } from './use-field-change'
import { getPropValueName, getValueFromEvent } from './utils'
import { FormOptionsContext } from './form-options-context'
import { FormRule } from './form-store'
import { AopFactory } from '@/utils/function-aop'

export interface FormItemProps {
  name?: string
  valueProp?: string | ((type: any) => string)
  valueGetter?: (...args: any[]) => any
  children?: React.ReactNode
  rules?: FormRule[]
}

export function FormItem(props: FormItemProps) {
  const { name, valueProp = 'value', valueGetter = getValueFromEvent, children, rules } = props

  const store = useContext(FormStoreContext)
  const options = useContext(FormOptionsContext)
  const [value, setValue] = useState(name && store ? store.getFieldValue(name) : undefined)
  const [error, setError] = useState(name && store ? store.getFieldError(name) : undefined)

  const onChange = useCallback(
    (...args: any[]) => {
      const values = store!.getFieldValue();
      const value = valueGetter(...args);
      const error = store!.getFieldError(name!);
      // 设置值
      name && store && store.setFieldValue(name, value);
      // 执行onFormChange事件
      name && options?.onFormChange && options?.onFormChange({ name: name, value: value, values: values, error: error })
    },
    [name, store, valueGetter]
  )
console.log(onChange)
  const aopOnchange = new AopFactory(onChange);

  useFieldChange({
    store,
    name,
    rules,
    // 监听FormStore中的value变化
    onChange: () => {
      const value = store!.getFieldValue(name!);
      setValue(value);
    },
    // 监听错误变化
    onError: () => {
      const error = store!.getFieldError(name!);
      setError(error);
    }
  })

  let child: any = children

  if (name && store && isValidElement(child)) {
    const { errorClassName = 'error' } = options
    const valueKey = getPropValueName(valueProp, child && child.type)
    const childProps = child?.props as any;
    // 对onChange方法进行aop包装，在后面添加子元素自身的onChange
    const childOnChange = childProps?.onChange;
    const aopOnchangeRet = aopOnchange.addAfter(childOnChange)

    let className = childProps?.className || ''
    if (error) className += ' ' + errorClassName

    const newChildProps = { className, [valueKey]: value, onChange: aopOnchangeRet }
    child = cloneElement(child, newChildProps)
  }

  return child
}
