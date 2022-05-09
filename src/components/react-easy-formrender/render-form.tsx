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
    onPropertiesChange,
    ...restProps
  } = props;

  const { properties, ...schemaRest } = schema;
  const rest = { ...schemaRest, ...restProps };

  return (
    <Form store={store} {...rest}>
      <RenderFormChildren childrenName="default" onPropertiesChange={onPropertiesChange} properties={properties} watch={watch} widgets={widgets} Fields={Fields} />
    </Form>
  );
}
