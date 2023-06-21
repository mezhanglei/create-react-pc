import RenderFormDefault, { RenderFormChildren as RenderFormChilds, RenderFormChildrenProps, RenderFormProps } from '@/components/react-easy-formrender';
import React from 'react';
import { BaseComponents } from './components';
import moment from 'moment';
import { Item } from '@/components/react-easy-formcore/components/item';

export * from '@/components/react-easy-formrender';

export interface CustomOptions {
  isEditor?: boolean; // 是否为编辑态
}

// RenderFormChildren
export type CustomRenderFormChildrenProps = RenderFormChildrenProps & CustomOptions;
export function RenderFormChildren(props: CustomRenderFormChildrenProps) {
  return (
    <RenderFormChilds
      {...props}
      components={{ ...BaseComponents, ...props?.components }}
      expressionImports={{ moment }}
    />
  );
}

// RenderForm
export type CustomRenderFormProps = RenderFormProps & CustomOptions
export default function FormRender(props: CustomRenderFormProps) {
  const { options, ...rest } = props;
  return (
    <RenderFormDefault
      {...rest}
      options={{ ...options, component: Item }}
      components={{ ...BaseComponents, ...props?.components }}
      expressionImports={{ moment }}
    />
  );
}
