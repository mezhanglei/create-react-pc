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
    customList,
    customChild,
    ...restProps
  } = props;

  const { properties, ...schemaRest } = schema;
  const rest = { ...restProps, ...schemaRest };

  return (
    <Form store={store} {...rest}>
      <RenderFormChildren customChild={customChild} customList={customList} onPropertiesChange={onPropertiesChange} properties={properties} watch={watch} widgets={widgets} Fields={Fields} />
    </Form>
  );
}
