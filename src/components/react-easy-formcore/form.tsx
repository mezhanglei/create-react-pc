import './style.less'

import React, { CSSProperties } from 'react'

import { FormItem } from './form-item'
import { FormStore } from './form-store'
import { FormStoreContext } from './form-store-context'
import { FormOptions, FormOptionsContext } from './form-options-context'
import { FormList } from './form-list'

// 缓存数组类型的组件的路径
export const formListPath: string[] = [];
export interface FormProps extends FormOptions {
  className?: string
  store: FormStore
  style?: CSSProperties
  children?: React.ReactNode
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  onReset?: (e: React.FormEvent<HTMLFormElement>) => void
}

export function Form(props: FormProps) {
  const { className = '', style, children, store, onSubmit, onReset, ...options } = props

  const classNames = 'rh-form ' + className

  return (
    <FormStoreContext.Provider value={store}>
      <FormOptionsContext.Provider value={options}>
        <form className={classNames} style={style} onSubmit={onSubmit} onReset={onReset}>
          {children}
        </form>
      </FormOptionsContext.Provider>
    </FormStoreContext.Provider>
  )
}

Form.Item = FormItem
Form.List = FormList
