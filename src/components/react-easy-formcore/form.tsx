import './style.less'

import React, { CSSProperties, useEffect } from 'react'
import { FormItem } from './form-item'
import { FormStore } from './form-store'
import { FormStoreContext, FormValuesContext } from './form-store-context'
import { FormOptions, FormOptionsContext } from './form-options-context'
import { FormList } from './form-list';
import { Row } from 'react-flexbox-grid';

// 缓存数组类型的组件的路径
export interface FormProps<S = FormStore> extends FormOptions {
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

  const classNames = 'rh-form ' + className

  useEffect(() => {
    onMount && onMount();
  }, []);

  return (
    <form className={classNames} style={style} onSubmit={onSubmit} onReset={onReset}>
      <FormStoreContext.Provider value={store}>
        <FormValuesContext.Provider value={initialValues}>
          <FormOptionsContext.Provider value={options}>
            <Row className='flex-form-row'>
              {children}
            </Row>
          </FormOptionsContext.Provider>
        </FormValuesContext.Provider>
      </FormStoreContext.Provider>
    </form>
  )
}

Form.Item = FormItem
Form.List = FormList
