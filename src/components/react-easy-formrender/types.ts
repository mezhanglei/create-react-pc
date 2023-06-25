import { ReactNode } from "react";
import { FormItemProps, FormProps, FormRule, FormStore } from "../react-easy-formcore";
import { FormRenderStore } from "./formrender-store";

// 组件JSON描述
export interface FormComponent {
  type?: string;
  props?: any & { children?: any | Array<FormComponent> };
}

export type UnionComponent<P> =
  | React.ComponentType<P>
  | React.ForwardRefExoticComponent<P>
  | React.FC<P>
  | keyof React.ReactHTML;

// 表单上的组件联合类型
export type CustomUnionType = FormComponent | Array<FormComponent> | UnionComponent<any> | Function | ReactNode

// 最终生成的表单域
export type GenerateFormNodeProps<T = {}> = FormComponent & FormItemProps & T & {
  ignore?: boolean; // 标记当前节点为非表单节点
  inside?: CustomUnionType; // 节点内层嵌套组件
  outside?: CustomUnionType; // 节点外层嵌套组件
  readOnly?: boolean; // 只读模式
  readOnlyRender?: CustomUnionType; // 只读模式下的组件
  typeRender?: CustomUnionType; // 表单控件自定义渲染
  properties?: PropertiesData;
  hidden?: boolean;
}

// 表单属性对象
export type PropertiesData = { [name: string]: FormNodeProps } | FormNodeProps[]
// render函数
export type CustomRenderType = (params: GeneratePrams<any> & { children?: any }) => any;

// 表单域(支持字符串表达式的表单域)
export type FormNodeProps = {
  [key in keyof GenerateFormNodeProps]: key extends 'rules' ?
  (string | Array<{ [key in keyof FormRule]: FormRule[key] | string }> | GenerateFormNodeProps[key])
  : (key extends 'properties' ? GenerateFormNodeProps[key] : (string | GenerateFormNodeProps[key]))
}

export type WatchHandler = (newValue: any, oldValue: any) => void

// 不带form容器的渲染组件props
export interface RenderFormChildrenProps<T = {}> {
  // 给字符串表达式传入外部变量
  expressionImports?: object;
  uneval?: boolean;
  watch?: { [key: string]: { immediate?: boolean, handler: WatchHandler } | WatchHandler };
  components?: any;
  inside?: CustomUnionType;
  properties?: PropertiesData; // 渲染数据
  // 自定义渲染列表组件
  renderList?: CustomRenderType;
  // 自定义渲染子表单域
  renderItem?: CustomRenderType;
  // 渲染数据回调函数
  onPropertiesChange?: (newValue: PropertiesData, oldValue?: PropertiesData) => void;
  formrender?: FormRenderStore;
  options?: GenerateFormNodeProps<T> | ((params: GenerateFormNodeProps<T>) => GenerateFormNodeProps<T>); // 组件公共传参
  evalPropNames?: Array<string>; // 表达式允许的字符串
}

// 带form容器的渲染组件props
export interface RenderFormProps<T = {}> extends Omit<FormProps, 'form'>, RenderFormChildrenProps<T> {
  form?: FormStore;
};

// 组件公共的参数
export interface GeneratePrams<T = {}> {
  name?: string;
  path?: string;
  field?: GenerateFormNodeProps<T>;
  parent?: { name?: string; path?: string, field?: GenerateFormNodeProps<T>; };
  formrender?: FormRenderStore;
  form?: FormStore;
};
