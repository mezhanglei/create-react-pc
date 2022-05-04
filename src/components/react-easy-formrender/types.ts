import { FormItemProps, FormOptions, FormProps } from "../react-easy-formcore";
import { FormRenderStore } from "./formrender-store";
import { defaultFields } from './register';

export interface GridProps {
  colspan?: number; // 所有屏幕显示列宽格数
  xs?: number; // 屏幕 < 576px 响应式栅格
  sm?: number; // 屏幕 ≥ 576px 响应式栅格
  md?: number; // 屏幕 ≥ 768px 响应式栅格
  lg?: number; // 屏幕 ≥ 992px 响应式栅格
}

// 表单域(绑定表单字段)
export interface FormFieldProps extends FormItemProps, GridProps {
  readOnly?: boolean; // 只读模式
  readOnlyWidget?: string; // 只读模式下的组件，和readOnlyRender只能生效一个，readOnlyRender优先级最高
  readOnlyRender?: any; // 只读模式下的组件，和readOnlyWidget只能生效一个，readOnlyRender优先级最高
  widget?: string; // 表单控件代表的字符串，和properties属性不能同时存在
  widgetProps?: { children?: JSX.Element | Array<{ widget: string, widgetProps: FormFieldProps['widgetProps'] }>, [key: string]: any }; // 表单控件自有的props属性
  hidden?: string | boolean; // 显示隐藏的逻辑，支持字符串表达式
  properties?: { [name: string]: FormFieldProps } | FormFieldProps[]; // 嵌套的表单控件 为对象时表示对象嵌套，为数组类型时表示数组集合
}

// schema
export interface SchemaData extends FormProps<FormRenderStore>, GridProps {
  properties: { [key: string]: FormFieldProps }
}

export type WatchHandler = (newValue: any, oldValue: string) => void

// 带form容器的渲染组件props
export interface RenderFormProps extends FormProps<FormRenderStore> {
  schema: SchemaData;
  watch?: { [key: string]: { immediate?: boolean, handler: WatchHandler } | WatchHandler };
  widgets: { [key: string]: any };
  Fields?: typeof defaultFields;
};

// 不带form容器的渲染组件props
export interface RenderFormChildrenProps extends FormOptions {
  schema: SchemaData;
  watch?: { [key: string]: { immediate?: boolean, handler: WatchHandler } | WatchHandler };
  widgets: { [key: string]: any };
  Fields?: typeof defaultFields;
};

export type ValueOf<T> = T[keyof T];
