import React from 'react';
import { RenderFormProps, SchemaData } from './types';
import { Form } from '../react-easy-formcore';
import RenderFormChildren from './render-children';

// 带form容器的表单渲染
export default function RenderForm(props: RenderFormProps) {
  const {
    store,
    onSchemaChange,
    schema = {},
    ...restProps
  } = props;

  const { properties, ...restSchema } = schema;
  const mergeProps = { ...restProps, ...restSchema };
  const { Fields,
    controls,
    components,
    watch,
    renderItem,
    renderList,
    inside, ...formProps } = mergeProps;

  const onChange = (newValue: SchemaData['properties'], oldValue: SchemaData['properties']) => {
    const oldSchema = { ...schema };
    schema['properties'] = newValue;
    oldSchema['properties'] = oldValue;
    onSchemaChange && onSchemaChange(schema, oldSchema);
  }

  return (
    <Form store={store} {...formProps}>
      <RenderFormChildren {...mergeProps} properties={properties} onPropertiesChange={onChange} />
    </Form>
  );
}
