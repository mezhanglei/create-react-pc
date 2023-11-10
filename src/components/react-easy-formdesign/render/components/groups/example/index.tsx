import React from 'react';
import FormRender, { CustomRenderFormProps, useFormStore } from '../../../';
import FormConfigs from './render';

const ExampleGroup = (props: any) => {
  const form = useFormStore();
  const { value, onChange } = props;

  const handleChange: CustomRenderFormProps['onFieldsChange'] = (_, values) => {
    onChange && onChange(values);
  }

  return <FormRender form={form} properties={FormConfigs} onFieldsChange={handleChange} />
}

export default ExampleGroup;