import React from 'react';
import { RenderFormProps } from './types';
import { Form } from '../react-easy-formcore';
import RenderFormChildren from './render-children';

// 带form容器的表单渲染
export default function RenderForm(props: RenderFormProps) {
  const {
    store,
    form,
    uneval,
    properties,
    controls,
    components,
    watch,
    renderItem,
    renderList,
    inside,
    onPropertiesChange,
    ...formProps
  } = props;

  return (
    <Form store={form} {...formProps}>
      <RenderFormChildren
        uneval={uneval}
        store={store}
        properties={properties}
        controls={controls}
        components={components}
        watch={watch}
        renderItem={renderItem}
        renderList={renderList}
        inside={inside}
        onPropertiesChange={onPropertiesChange}
      />
    </Form>
  );
}
