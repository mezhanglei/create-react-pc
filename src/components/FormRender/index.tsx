// register
import DefaultFormRender, { FormChildren as DefaultFormChildren, FormRenderProps, FormChildrenProps } from '@simpleform/render';
import '@simpleform/render/lib/css/main.css';
import React from 'react';
import dayjs from 'dayjs';
import { widgets } from './components';

export * from '@simpleform/render';

export type CustomFormChildrenProps = FormChildrenProps<any>;
export function FormChildren(props: CustomFormChildrenProps) {
  const { components, variables, ...rest } = props;
  return (
    <DefaultFormChildren
      options={{ props: { autoComplete: 'off' } }}
      components={{ ...widgets, ...components }}
      variables={{ ...variables, dayjs }}
      {...rest}
    />
  );
}
export type CustomFormRenderProps = FormRenderProps<any>;
export default function FormRender(props: CustomFormRenderProps) {
  const { components, variables, ...rest } = props;
  return (
    <DefaultFormRender
      options={{ props: { autoComplete: 'off' } }}
      components={{ ...widgets, ...components }}
      variables={{ ...variables, dayjs }}
      {...rest}
    />
  );
};
