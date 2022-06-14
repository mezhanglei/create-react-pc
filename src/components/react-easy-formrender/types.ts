import { FormItemProps, FormProps } from "../react-easy-formcore";
import { FormRenderStore } from "./formrender-store";
import { defaultFields } from './components';

// 表单域(绑定表单字段)
export interface FormFieldProps extends FormItemProps {
  readOnly?: boolean; // 只读模式
  readOnlyWidget?: string; // 只读模式下的组件，和readOnlyRender只能生效一个，readOnlyRender优先级最高
  readOnlyRender?: any; // 只读模式下的组件，和readOnlyWidget只能生效一个，readOnlyRender优先级最高
  hidden?: string | boolean; // 显示隐藏的逻辑，支持字符串表达式
  widget?: string; // 表单控件代表的字符串，和properties属性不能同时存在
  widgetProps?: { children?: any | Array<{ widget: string, widgetProps: FormFieldProps['widgetProps'] }>, [key: string]: any }; // 表单控件自有的props属性
  properties?: { [name: string]: FormFieldProps } | FormFieldProps[]; // 嵌套的表单控件 为对象时表示对象嵌套，为数组类型时表示数组集合
}

// schema
export interface SchemaData extends FormProps<FormRenderStore> {
  properties: { [key: string]: FormFieldProps } | FormFieldProps[]
}

export type WatchHandler = (newValue: any, oldValue: string) => void

export interface BaseRenderProps {
  onPropertiesChange?: (properties: SchemaData['properties'], oldProperties?: SchemaData['properties']) => void;
  watch?: { [key: string]: { immediate?: boolean, handler: WatchHandler } | WatchHandler };
  widgets?: any;
  slotWidgets?: any;
  Fields?: typeof defaultFields;
  // 自定义渲染列表
  customList?: React.ComponentType<CustomListProps>;
  // 自定义渲染子元素
  customChild?: React.ComponentType<GenerateParams>;
}

// 带form容器的渲染组件props
export interface RenderFormProps extends FormProps<FormRenderStore>, BaseRenderProps {
  schema: SchemaData;
};

// 不带form容器的渲染组件props
export interface RenderFormChildrenProps extends BaseRenderProps {
  properties: SchemaData['properties']; // 控件数据源的数据
};

export type ValueOf<T> = T[keyof T];
// slot组件的params
export interface SlotParams { type: string, props?: any, hidden?: boolean, addItem?: FormFieldProps };
export interface WidgetParams { widget: string, widgetProps: FormFieldProps['widgetProps'] };
// 列表组件的params
export interface CustomListProps { children: any, properties: SchemaData['properties'], parent?: GenerateParams };
// 生成子元素
export interface GenerateParams { name: string, field: FormFieldProps, path?: string, index?: number };
// 返回列表
export type getChildrenList = (properties: SchemaData['properties'], generate: generateChildFunc, parent?: GenerateParams) => any;
export type generateChildFunc = (params: GenerateParams, properties?: SchemaData['properties']) => JSX.Element | undefined;
