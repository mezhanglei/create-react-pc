import React from 'react';
import { RenderFormProps } from './types';
import { Form, useFormStore } from '../react-easy-formcore';
import RenderFormChildren from './render-children';

// 表单元素渲染
export default function RenderForm(props: RenderFormProps) {
  const {
    formrender,
    form,
    uneval,
    properties,
    components,
    watch,
    renderItem,
    renderList,
    inside,
    onPropertiesChange,
    expressionImports,
    options,
    evalPropNames,
    ...formOptions
  } = props;

  const formStore = form ?? useFormStore();

  return (
    <Form form={formStore} {...formOptions}>
      <RenderFormChildren
        evalPropNames={evalPropNames}
        options={options}
        expressionImports={expressionImports}
        uneval={uneval}
        form={formStore}
        formrender={formrender}
        properties={properties}
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
