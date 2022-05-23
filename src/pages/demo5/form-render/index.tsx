import RenderBaseForm, { RenderFormProps } from '@/components/react-easy-formrender';
import React from 'react';
import { AntdBaseWidgets } from './widgets';


export * from '@/components/react-easy-formrender';

export interface FormRenderProps extends RenderFormProps {
  widgets?: typeof AntdBaseWidgets
}

export default function FormRender(props: FormRenderProps) {
  return (
    <RenderBaseForm {...props} widgets={{ ...AntdBaseWidgets, ...props?.widgets }} />
  );
}