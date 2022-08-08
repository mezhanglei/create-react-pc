import React, { CSSProperties } from 'react'

export interface FormRoot {
  onFieldsChange?: (obj: { path: string, name?: string, value: any }) => void;
  onValuesChange?: (obj: { path?: string, name?: string, value: any }) => void;
}

export type Layout = 'horizontal' | 'vertical' | string;

export interface FormOptions extends FormRoot {
  colon?: boolean;
  layout?: Layout;
  labelWidth?: number;
  labelAlign?: CSSProperties['textAlign'],
  inline?: boolean;
  labelStyle?: CSSProperties;
  compact?: boolean;
  required?: boolean;
  gutter?: number;
}

export const FormOptionsContext = React.createContext<FormOptions>({});
