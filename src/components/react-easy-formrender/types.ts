import { ReactNode } from "react";
import { FormItemProps, FormProps, FormStore } from "../react-easy-formcore";
import { FormRenderStore } from "./formrender-store";

// 从原接口中提取属性，然后用新的替换它们
type Overwrite<T, U> = Omit<T, keyof U> & U;

// 组件JSON描述
export interface FormComponent {
  type?: string;
  props?: any;
  children?: any | Array<FormComponent>;
  hidden?: string | boolean;
}

export type UnionComponent<P> =
  | React.ComponentType<P>
  | React.ForwardRefExoticComponent<P>
  | React.FC<P>
  | keyof React.ReactHTML;

// 表单上的组件联合类型
export type FieldUnionType = FormComponent | Array<FormComponent> | UnionComponent<any> | Function

export interface BaseFieldProps extends FormComponent {
  ignore?: boolean; // 忽略当前节点不会作为表单值
  fieldComponent?: FieldUnionType; // 表单域组件
  inside?: FieldUnionType; // 表单域组件内层嵌套组件
  outside?: FieldUnionType; // 表单域组件外层嵌套组件
  readOnly?: boolean; // 只读模式
  readOnlyRender?: FieldUnionType | ReactNode; // 只读模式下的组件
  typeRender?: any; // 表单控件自定义渲染
}

// 表单属性对象
export type PropertiesData = { [name: string]: FormFieldProps } | FormFieldProps[]

// 表单域(绑定表单字段)
export interface FormFieldProps extends Overwrite<FormItemProps, {
  valueGetter?: string | ((...args: any[]) => any) | any;
  valueSetter?: string | ((value: any) => any) | any;
}>, BaseFieldProps {
  properties?: PropertiesData; // 嵌套的表单控件 为对象时表示对象嵌套，为数组类型时表示数组集合
}

export type WatchHandler = (newValue: any, oldValue: any) => void

export interface BaseRenderProps {
  watch?: { [key: string]: { immediate?: boolean, handler: WatchHandler } | WatchHandler };
  controls?: any;
  components?: any;
  inside?: FieldUnionType;
  // 自定义渲染列表组件
  renderList?: (params: GeneratePrams<any>) => any;
  // 自定义渲染子表单域
  renderItem?: (params: GeneratePrams<any>) => any;
}

// 带form容器的渲染组件props
export interface RenderFormProps extends Overwrite<FormProps, { store?: FormRenderStore }>, BaseRenderProps {
  onPropertiesChange?: (newValue: PropertiesData, oldValue?: PropertiesData) => void;
  properties?: PropertiesData; // 控件数据源的数据
  form?: FormStore
};

// 不带form容器的渲染组件props
export interface RenderFormChildrenProps extends BaseRenderProps {
  onPropertiesChange?: (newValue: PropertiesData, oldValue?: PropertiesData) => void;
  properties?: PropertiesData; // 控件数据源的数据
  store?: FormRenderStore
};

export type ValueOf<T> = T[keyof T];
// 组件公共的参数
export interface GeneratePrams<T = FormFieldProps> {
  name?: string | number;
  field?: T;
  parent?: string;
  store?: FormRenderStore;
  form: FormStore;
  children?: any
};
