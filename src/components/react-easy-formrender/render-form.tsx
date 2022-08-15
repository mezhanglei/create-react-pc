import React from 'react';
import { RenderFormChildrenProps, RenderFormProps } from './types';
import { Form } from '../react-easy-formcore';
import RenderFormChildren from './render-children';

// 带form容器的表单渲染
export default function RenderForm(props: RenderFormProps) {
  const {
    store,
    schema = {},
    ...restProps
  } = props;
  
  const mergeProps = { ...restProps, ...schema };

  const onPropertiesChange: RenderFormChildrenProps['onPropertiesChange'] = (newValue) => {
    const newSchema = { ...schema };
    newSchema['properties'] = newValue;
    mergeProps?.onSchemaChange && mergeProps?.onSchemaChange(newSchema);
  }

  return (
    <Form store={store} {...mergeProps}>
      <RenderFormChildren {...mergeProps} onPropertiesChange={onPropertiesChange} />
    </Form>
  );
}
