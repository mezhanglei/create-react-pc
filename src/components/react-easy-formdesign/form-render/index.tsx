import RenderFormDefault, { RenderFormChildren as RenderFormChilds, RenderFormChildrenProps, RenderFormProps } from '@/components/react-easy-formrender';
import React from 'react';
import { BaseComponents } from './components';
import moment from 'moment';

export * from '@/components/react-easy-formrender';

// 重新包装子元素渲染组件
export function RenderFormChildren(props: RenderFormChildrenProps) {
  return (
    <RenderFormChilds
      {...props}
      components={{ ...BaseComponents, ...props?.components }}
      expressionImports={{ moment }}
    />
  );
}

// 完整表单组件
export interface CustomOptions {
  isEditor?: boolean; // 是否为编辑态
}
export default function FormRender(props: RenderFormProps<CustomOptions>) {
  return (
    <RenderFormDefault
      {...props}
      components={{ ...BaseComponents, ...props?.components }}
      expressionImports={{ moment }}
    />
  );
}
