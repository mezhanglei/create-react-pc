import { ReactNode } from "react";
import { FormItemProps, FormProps } from "../react-easy-formcore";
import { FormRenderStore } from "./formrender-store";

// 从原接口中提取属性，然后用新的替换它们
type Overwrite<T, U> = Omit<T, keyof U> & U;

// 扩展的interface
interface Extension {
  valueGetter?: string | ((...args: any[]) => any) | any;
  valueSetter?: string | ((value: any) => any) | any;
}

// 组件JSON描述
export interface SchemaComponent {
  type?: string;
  props?: any;
  children?: any | Array<SchemaComponent>;
  hidden?: string | boolean;
}

// 表单上的组件联合类型：包括SchemaComponent，组件声明
export type FieldUnionType = SchemaComponent | Array<SchemaComponent> | React.ComponentType<any> | Function

export interface BaseFieldProps extends SchemaComponent {
  ignore?: boolean; // 忽略当前节点不会作为表单值
  fieldComponent?: FieldUnionType; // 表单域组件
  inside?: FieldUnionType; // 表单域组件内层嵌套组件
  outside?: FieldUnionType; // 表单域组件外层嵌套组件
  readOnly?: boolean; // 只读模式
  readOnlyRender?: FieldUnionType | ReactNode; // 只读模式下的组件
  typeRender?: any; // 表单控件自定义渲染
}

// 表单域(绑定表单字段)
export interface FormFieldProps extends Overwrite<FormItemProps, Extension>, BaseFieldProps {
  properties?: { [name: string]: FormFieldProps } | FormFieldProps[]; // 嵌套的表单控件 为对象时表示对象嵌套，为数组类型时表示数组集合
}

// schema
export interface SchemaData extends FormProps<FormRenderStore> {
  properties?: { [key: string]: FormFieldProps } | FormFieldProps[]
}

export type WatchHandler = (newValue: any, oldValue: any) => void

export interface BaseRenderProps {
  watch?: { [key: string]: { immediate?: boolean, handler: WatchHandler } | WatchHandler };
  controls?: any;
  components?: any;
  inside?: FieldUnionType;
  // 自定义渲染列表
  renderList?: React.ComponentType<GeneratePrams<any>>;
  // 自定义渲染子元素
  renderItem?: React.ComponentType<GeneratePrams<any>>;
}

// 带form容器的渲染组件props
export interface RenderFormProps extends FormProps<FormRenderStore>, BaseRenderProps {
  onSchemaChange?: (newValue: SchemaData, oldValue?: SchemaData) => void;
  schema: SchemaData;
};

// 不带form容器的渲染组件props
export interface RenderFormChildrenProps extends BaseRenderProps {
  onPropertiesChange?: (newValue: SchemaData['properties'], oldValue?: SchemaData['properties']) => void;
  properties?: SchemaData['properties']; // 控件数据源的数据
};

export type ValueOf<T> = T[keyof T];
// 组件公共的参数
export interface GeneratePrams<T = FormFieldProps> { name?: string, field?: T, parent?: string, store?: FormRenderStore, children?: any };
