import RenderBaseForm, {RenderFormChildren as RenderFormChilds, RenderFormChildrenProps, RenderFormProps } from '@/components/react-easy-formrender';
import React from 'react';
import { AntdBaseControls } from './controls';


export * from '@/components/react-easy-formrender';

// 重新包装子元素渲染组件
export function RenderFormChildren(props: RenderFormChildrenProps) {
  return (
    <RenderFormChilds {...props} controls={{ ...AntdBaseControls, ...props?.controls }} />
  );
}

// 完整表单组件
export interface FormRenderProps extends RenderFormProps {
  controls?: any
}
export default function FormRender(props: FormRenderProps) {
  return (
    <RenderBaseForm {...props} controls={{ ...AntdBaseControls, ...props?.controls }} />
  );
}