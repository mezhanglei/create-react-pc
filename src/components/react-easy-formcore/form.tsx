import React, { CSSProperties, LegacyRef, useEffect } from 'react'
import { FormItem } from './form-item'
import { FormStore } from './form-store'
import { FormStoreContext, FormValuesContext, FormOptionsContext } from './form-context'
import { FormList } from './form-list';
import { ItemCoreProps } from './item-core'
import { ItemProps } from './components/item'

interface CreateFormProps extends React.HTMLAttributes<HTMLElement> {
  tagName?: keyof React.ReactHTML
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  onReset?: (e: React.FormEvent<HTMLFormElement>) => void;
}
const CreateForm = React.forwardRef((props: CreateFormProps, ref: LegacyRef<any>) => {
  const { tagName = "form", ...rest } = props;
  return React.createElement(tagName, { ...rest, ref });
});

export type FormProps<S = FormStore, T = ItemProps> = T & ItemCoreProps & {
  className?: string;
  store?: S;
  style?: CSSProperties;
  children?: any;
  initialValues?: Partial<unknown>;
  onMount?: () => void;
} & CreateFormProps;

export function Form(props: FormProps) {
  const { className = '', style, children, store, initialValues, tagName, onSubmit, onReset, onMount, ...options } = props

  const classNames = 'easy-form ' + className

  useEffect(() => {
    onMount && onMount();
  }, [onMount]);

  return (
    <CreateForm
      tagName={tagName}
      className={classNames}
      style={style}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(e);
      }}
      onReset={onReset}
    >
      <FormStoreContext.Provider value={store}>
        <FormOptionsContext.Provider value={options}>
          <FormValuesContext.Provider value={initialValues}>
            {children}
          </FormValuesContext.Provider>
        </FormOptionsContext.Provider>
      </FormStoreContext.Provider>
    </CreateForm>
  )
}

Form.Item = FormItem
Form.List = FormList
