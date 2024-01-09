// register
import FormRenderCore, { FormChildren as FormChildrenCore, FormRenderProps, FormChildrenProps } from '@simpleform/render';
import '@simpleform/render/lib/css/main.css';
import React from 'react';
import dayjs from 'dayjs';
import { widgets } from './components';

export * from '@simpleform/render';

export type CustomFormChildrenProps = FormChildrenProps<any>;
export function FormChildren(props: CustomFormChildrenProps) {
  const { components, plugins, ...rest } = props;
  return (
    <FormChildrenCore
      options={{ props: { autoComplete: 'off' } }}
      components={{ ...widgets, ...components }}
      plugins={{ ...plugins, dayjs }}
      {...rest}
    />
  );
}
export type CustomFormRenderProps = FormRenderProps<any>;
export default function FormRender(props: CustomFormRenderProps) {
  const { components, plugins, ...rest } = props;
  return (
    <FormRenderCore
      options={{ props: { autoComplete: 'off' } }}
      components={{ ...widgets, ...components }}
      plugins={{ ...plugins, dayjs }}
      {...rest}
    />
  );
};
