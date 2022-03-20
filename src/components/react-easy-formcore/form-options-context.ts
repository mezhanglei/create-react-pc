import React from 'react'

export interface FormFunc {
  onFieldsChange?: (obj: { path: string, value: any }) => void;
  onValuesChange?: (obj: { path?: string, value: any }) => void;
}

export interface FormOptions extends FormFunc {
  initialValues?: Partial<unknown>;
  inline?: boolean;
  compact?: boolean;
  required?: boolean;
  labelWidth?: number;
  labelAlign?: 'left' | 'right';
  gutter?: number;
}

export const FormOptionsContext = React.createContext<FormOptions>({});
