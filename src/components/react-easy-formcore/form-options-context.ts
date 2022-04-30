import React, { CSSProperties } from 'react'

export interface FormFunc {
  onFieldsChange?: (obj: { path: string, value: any }) => void;
  onValuesChange?: (obj: { path?: string, value: any }) => void;
}

export enum LayoutEnum {
  Horizontal= 'horizontal', // 水平布局
  Vertical= 'vertical', // 垂直布局
  Inline= 'inline' // 行内布局
}

export interface FormOptions extends FormFunc {
  layout?: LayoutEnum;
  labelStyle?: CSSProperties;
  initialValues?: Partial<unknown>;
  compact?: boolean;
  required?: boolean;
  gutter?: number;
}

export const FormOptionsContext = React.createContext<FormOptions>({});
