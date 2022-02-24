import React from 'react';
import { RenderFormProps } from './types';
import { Form } from '../react-easy-formcore';
import RenderFormChildren from './render-children';

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
      <RenderFormChildren children={children} properties={schema?.properties} watch={watch} widgets={widgets} Fields={Fields} />
    </Form>
  )
}
