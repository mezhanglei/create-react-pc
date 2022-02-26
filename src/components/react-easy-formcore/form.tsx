import './style.less'

import React, { CSSProperties, useEffect } from 'react'

import { FormItem } from './form-item'
import { FormStore } from './form-store'
import { FormStoreContext, FormValuesContext } from './form-store-context'
import { FormOptions, FormOptionsContext } from './form-options-context'
import { FormList } from './form-list'

// 缓存数组类型的组件的路径
export const formListPath: string[] = [];
export interface FormProps extends FormOptions {
  className?: string
  store?: FormStore
  style?: CSSProperties
  children?: React.ReactNode
  initialValues?: Partial<unknown>,
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  onReset?: (e: React.FormEvent<HTMLFormElement>) => void
  onMount?: () => void
}

export function Form(props: FormProps) {
  const { className = '', style, children, store, initialValues, onSubmit, onReset, onMount, ...options } = props

  const classNames = 'rh-form ' + className

  useEffect(() => {
    onMount && onMount();
  }, []);

  return (
    <form className={classNames} style={style} onSubmit={onSubmit} onReset={onReset}>
      <FormStoreContext.Provider value={store}>
        <FormValuesContext.Provider value={initialValues}>
          <FormOptionsContext.Provider value={options}>
            {children}
          </FormOptionsContext.Provider>
        </FormValuesContext.Provider>
      </FormStoreContext.Provider>
    </form>
  )
}

Form.Item = FormItem
Form.List = FormList
