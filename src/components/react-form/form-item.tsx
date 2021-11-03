import React, { cloneElement, isValidElement, useCallback, useContext, useState } from 'react'

import { FormStoreContext } from './form-store-context'
import { useFieldChange } from './use-field-change'
import { getPropValueName, getValueFromEvent } from './utils'
import { FormOptionsContext } from './form-options-context'
import { FormRule } from './form-store'

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
      name && store && store.setFieldValue(name, valueGetter(...args))
    },
    [name, store, valueGetter]
  )

  useFieldChange({
    store,
    name,
    rules,
    onChange: () => {
      setValue(store!.getFieldValue(name!))
      setError(store!.getFieldError(name!))
    }
  })

  let child: any = children

  if (name && store && isValidElement(child)) {
    const { errorClassName = 'error' } = options
    const valueKey = getPropValueName(valueProp, child && child.type)
    const oldProps = child?.props as any;

    let className = oldProps?.className || ''
    if (error) className += ' ' + errorClassName

    const newChildProps = { className, [valueKey]: value, onChange: oldProps?.onChange || onChange }
    child = cloneElement(child, newChildProps)
  }

  return child
}
