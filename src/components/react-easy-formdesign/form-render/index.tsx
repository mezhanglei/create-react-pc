import RenderFormDefault, { RenderFormChildren as RenderFormChilds, RenderFormChildrenProps, RenderFormProps } from '@/components/react-easy-formrender';
import React from 'react';
import { registerComponents } from './components';
import moment from 'moment';
import { ConfigComponents, ConfigSettings } from './configs';

export * from '@/components/react-easy-formrender';
export { ConfigSettings, ConfigComponents }

export interface CustomOptions {
  isEditor?: boolean; // 是否为编辑态
}

// RenderFormChildren
export type CustomRenderFormChildrenProps = RenderFormChildrenProps<CustomOptions>;
export function RenderFormChildren(props: CustomRenderFormChildrenProps) {
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
export type CustomRenderFormProps = RenderFormProps<CustomOptions>
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
