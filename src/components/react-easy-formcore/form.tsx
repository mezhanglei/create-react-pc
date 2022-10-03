import React, { CSSProperties, useEffect } from 'react'
import { FormItem } from './form-item'
import { FormStore } from './form-store'
import { FormStoreContext, FormValuesContext, FormOptionsContext } from './form-context'
import { FormList } from './form-list';
import { ItemCoreProps } from './item-core'
import { ItemProps } from './components/item'

// 缓存数组类型的组件的路径
export type FormProps<S = FormStore, T = ItemProps>  = T & ItemCoreProps & {
  className?: string;
  store?: S;
  style?: CSSProperties;
  children?: any;
  initialValues?: Partial<unknown>;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  onReset?: (e: React.FormEvent<HTMLFormElement>) => void;
  onMount?: () => void;
}

export function Form(props: FormProps) {
  const { className = '', style, children, store, initialValues, onSubmit, onReset, onMount, ...options } = props

  const classNames = 'easy-form ' + className

  useEffect(() => {
    onMount && onMount();
  }, [onMount]);

  return (
    <form className={classNames} style={style} onSubmit={onSubmit} onReset={onReset}>
      <FormStoreContext.Provider value={store}>
        <FormOptionsContext.Provider value={options}>
          <FormValuesContext.Provider value={initialValues}>
            {children}
          </FormValuesContext.Provider>
        </FormOptionsContext.Provider>
      </FormStoreContext.Provider>
    </form>
  )
}

Form.Item = FormItem
Form.List = FormList
