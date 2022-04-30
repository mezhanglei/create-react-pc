import { FormItemProps, FormOptions, FormProps, LayoutEnum } from "../react-easy-formcore";
import { defaultFields } from './register';

export enum DisplayType {
  Row = 'row',
  Col = 'col'
}

// 表单域(绑定表单字段)
export interface FormFieldProps extends FormItemProps {
  displayType?: DisplayType; // 子元素布局
  readOnly?: boolean; // 只读模式
  readOnlyWidget?: string; // 只读模式下的组件，和readOnlyRender只能生效一个，readOnlyRender优先级最高
  readOnlyRender?: any; // 只读模式下的组件，和readOnlyWidget只能生效一个，readOnlyRender优先级最高
  widget: string; // 表单控件代表的字符串，和properties属性不能同时存在
  widgetProps?: { children?: JSX.Element | Array<{ widget: string, widgetProps: FormFieldProps['widgetProps'] }>, [key: string]: any }; // 表单控件自有的props属性
  hidden?: string | boolean; // 显示隐藏的逻辑，支持字符串表达式
  properties?: { [name: string]: FormFieldProps } | FormFieldProps[]; // 嵌套的表单控件 为对象时表示对象嵌套，为数组类型时表示数组集合
}

// schema
export interface SchemaData extends FormProps {
  properties: { [key: string]: FormFieldProps }
}

export type WatchHandler = (newValue: any, oldValue: string) => void

// 带form容器的渲染组件props
export interface RenderFormProps extends FormProps {
  schema: SchemaData;
  watch?: { [key: string]: { immediate?: boolean, handler: WatchHandler } | WatchHandler };
  widgets: { [key: string]: any };
  Fields?: typeof defaultFields;
  displayType?: DisplayType; // 子元素布局
};

// 不带form容器的渲染组件props
export interface RenderFormChildrenProps extends FormOptions {
  properties: SchemaData['properties'];
  initialValues?: Partial<unknown>;
  watch?: { [key: string]: { immediate?: boolean, handler: WatchHandler } | WatchHandler };
  widgets: { [key: string]: any };
  Fields?: typeof defaultFields;
  displayType?: DisplayType; // 子元素布局
};

export type ValueOf<T> = T[keyof T];
