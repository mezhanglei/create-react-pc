import React, { CSSProperties } from 'react'
import { ColProps } from 'react-flexbox-grid';

export interface FormRoot {
  onFieldsChange?: (obj: { path: string, value: any }) => void;
  onValuesChange?: (obj: { path?: string, value: any }) => void;
}

export type Layout = 'horizontal' | 'vertical' | string;

export interface FromColProps extends ColProps {
  span?: number; // 所有屏幕显示列宽格数
  xs?: number; // 屏幕 < 576px 响应式栅格
  sm?: number; // 屏幕 ≥ 576px 响应式栅格
  md?: number; // 屏幕 ≥ 768px 响应式栅格
  lg?: number; // 屏幕 ≥ 992px 响应式栅格
}

export interface FormOptions extends FormRoot {
  col?: FromColProps;
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
