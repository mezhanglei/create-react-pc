import RenderFormDefault, { RenderFormChildren as RenderFormChilds, RenderFormChildrenProps, RenderFormProps } from '@/components/react-easy-formrender';
import React from 'react';
import { BaseComponents } from './base-components';
import { BaseControls } from './base-controls';

export * from '@/components/react-easy-formrender';

// 重新包装子元素渲染组件
export function RenderFormChildren(props: RenderFormChildrenProps) {
  return (
    <RenderFormChilds {...props} controls={{ ...BaseControls, ...props?.controls }} components={{ ...BaseComponents, ...props?.components }} />
  );
}

// 完整表单组件
export default function FormRender(props: RenderFormProps) {
  return (
    <RenderFormDefault {...props} controls={{ ...BaseControls, ...props?.controls }} components={{ ...BaseComponents, ...props?.components }} />
  );
}