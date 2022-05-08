import React, { CSSProperties } from 'react'

export interface FormFunc {
  onFieldsChange?: (obj: { path: string, value: any }) => void;
  onValuesChange?: (obj: { path?: string, value: any }) => void;
}

export enum LabelAlignEnum {
  Horizontal= 'horizontal', // 水平布局
  Vertical= 'vertical', // 垂直布局
  Inline= 'inline' // 行内布局
}

export interface ColProps {
  span?: number; // 所有屏幕显示列宽格数
  xs?: number; // 屏幕 < 576px 响应式栅格
  sm?: number; // 屏幕 ≥ 576px 响应式栅格
  md?: number; // 屏幕 ≥ 768px 响应式栅格
  lg?: number; // 屏幕 ≥ 992px 响应式栅格
}

export interface FormOptions extends FormFunc {
  col?: ColProps;
  colon?: boolean;
  labelAlign?: LabelAlignEnum;
  labelStyle?: CSSProperties;
  initialValues?: Partial<unknown>;
  compact?: boolean;
  required?: boolean;
  gutter?: number;
}

export const FormOptionsContext = React.createContext<FormOptions>({});
