import React from 'react';
import { RenderFormProps } from './types';
import { Form } from '../react-easy-formcore';
import RenderFormChildren from './render-children';
import { FormRenderStoreContext } from './formrender-store';

// 带form容器的表单渲染
export default function RenderForm(props: RenderFormProps) {
  const {
    store,
    schema,
    watch,
    widgets,
    Fields,
    children,
    ...rest
  } = props;

  return (
    <Form store={store} {...rest}>
      <FormRenderStoreContext.Provider value={store}>
        <RenderFormChildren children={children} schema={schema} watch={watch} widgets={widgets} Fields={Fields} />
      </FormRenderStoreContext.Provider>
    </Form>
  )
}
