import RenderFormDefault, { RenderFormChildren as RenderFormChilds, RenderFormProps } from '@/components/react-easy-formrender';
import React from 'react';
import { registerComponents } from './components';
import moment from 'moment';
export * from '@/components/react-easy-formrender';

export interface CustomOptions {
  isEditor?: boolean; // 是否为编辑态
  context?: any; // 上下文环境
}

// RenderFormChildren
export type CustomRenderFormProps = RenderFormProps<CustomOptions>;

export function RenderFormChildren(props: CustomRenderFormProps) {
  const { components, expressionImports, ...rest } = props;
  return (
    <RenderFormChilds
      options={{ props: { autoComplete: 'off' } }}
      components={{ ...registerComponents, ...components }}
      expressionImports={{ ...expressionImports, moment }}
      {...rest}
    />
  );
}

// RenderForm
export default function FormRender(props: CustomRenderFormProps) {
  const { components, expressionImports, ...rest } = props;
  return (
    <RenderFormDefault
      options={{ props: { autoComplete: 'off' } }}
      components={{ ...registerComponents, ...components }}
      expressionImports={{ ...expressionImports, moment }}
      {...rest}
    />
  );
}
