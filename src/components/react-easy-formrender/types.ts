import { ReactNode } from "react";
import { FormItemProps, FormProps, FormRule, FormStore } from "../react-easy-formcore";
import { FormRenderStore } from "./formrender-store";

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

// 最终生成的表单域
export interface GenerateFieldProps extends FormComponent, FormItemProps {
  ignore?: boolean; // 标记当前节点为非表单节点
  fieldComponent?: FieldUnionType; // 表单域组件
  inside?: FieldUnionType; // 表单域组件内层嵌套组件
  outside?: FieldUnionType; // 表单域组件外层嵌套组件
  readOnly?: boolean; // 只读模式
  readOnlyRender?: FieldUnionType | ReactNode; // 只读模式下的组件
  typeRender?: any; // 表单控件自定义渲染
  properties?: PropertiesData;
}

// 表单属性对象
export type PropertiesData = { [name: string]: FormFieldProps } | FormFieldProps[]

// 表单域(支持字符串表达式的表单域)
export type FormFieldProps = {
  [key in keyof GenerateFieldProps]: key extends 'rules' ?
  (string | Array<{ [key in keyof FormRule]: FormRule[key] | string }> | GenerateFieldProps[key])
  : (key extends 'properties' ? GenerateFieldProps[key] : (string | GenerateFieldProps[key]))
}

export type WatchHandler = (newValue: any, oldValue: any) => void

// 不带form容器的渲染组件props
export interface RenderFormChildrenProps {
  // 给字符串表达式传入外部变量
  expressionImports?: object;
  uneval?: boolean;
  watch?: { [key: string]: { immediate?: boolean, handler: WatchHandler } | WatchHandler };
  controls?: any;
  components?: any;
  inside?: FieldUnionType;
  properties?: PropertiesData; // 渲染数据
  // 自定义渲染列表组件
  renderList?: (params: GeneratePrams<any>) => any;
  // 自定义渲染子表单域
  renderItem?: (params: GeneratePrams<any>) => any;
  // 渲染数据回调函数
  onPropertiesChange?: (newValue: PropertiesData, oldValue?: PropertiesData) => void;
  store?: FormRenderStore
}

// 带form容器的渲染组件props
export interface RenderFormProps extends Omit<FormProps, 'store'>, RenderFormChildrenProps {
  form?: FormStore
};

// 组件公共的参数
export interface GeneratePrams<T = GenerateFieldProps> {
  name?: string | number;
  field?: T;
  parent?: string;
  formparent?: string;
  store?: FormRenderStore;
  form: FormStore;
  children?: any
};
