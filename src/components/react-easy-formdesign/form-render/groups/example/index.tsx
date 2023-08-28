import React from 'react';
import FormRender, { useFormStore } from '../../index';
import FormConfigs from './render';

const ExampleGroup = (props) => {
  const form = useFormStore();
  return <FormRender form={form} properties={FormConfigs} />
}

export default ExampleGroup;