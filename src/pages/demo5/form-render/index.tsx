import RenderBaseForm, { RenderFormProps } from '@/components/react-easy-formrender';
import React from 'react';
import { AntdBaseWidgets } from './widgets';


export * from '@/components/react-easy-formrender';

export default function FormRender(props: RenderFormProps) {
  return (
    <RenderBaseForm {...props} widgets={{ ...AntdBaseWidgets, ...props?.widgets }} />
  );
}