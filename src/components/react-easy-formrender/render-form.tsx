import React from 'react';
import { RenderFormChildrenProps, RenderFormProps } from './types';
import { Form } from '../react-easy-formcore';
import RenderFormChildren from './render-children';

// 带form容器的表单渲染
export default function RenderForm(props: RenderFormProps) {
  const {
    store,
    schema = {},
    watch,
    widgets,
    Fields,
    children,
    onSchemaChange,
    customList,
    customInner,
    ...restProps
  } = props;

  const { properties, ...schemaRest } = schema;
  const rest = { ...restProps, ...schemaRest };

  const onPropertiesChange: RenderFormChildrenProps['onPropertiesChange'] = (newValue) => {
    const newSchema = { ...schemaRest };
    newSchema['properties'] = newValue;
    onSchemaChange && onSchemaChange(newSchema);
  }

  return (
    <Form store={store} {...rest}>
      <RenderFormChildren
        customInner={customInner}
        customList={customList}
        onPropertiesChange={onPropertiesChange}
        properties={properties}
        watch={watch}
        widgets={widgets}
        Fields={Fields} />
    </Form>
  );
}
