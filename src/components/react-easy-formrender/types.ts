import { ReactNode } from "react";
import { FormItemProps, FormProps } from "../react-easy-formcore";
import { defaultFields } from "./fields";
import { FormRenderStore } from "./formrender-store";

// 从原接口中提取属性，然后用新的替换它们
type Overwrite<T, U> = Omit<T, keyof U> & U;

// 扩展的interface
interface Extension {
  valueGetter?: string | ((...args: any[]) => any);
  valueSetter?: string | ((value: any) => any);
}

// 组件描述基本属性
export interface SchemaComponent {
  type?: string;
  props?: any;
  children?: any | Array<SchemaComponent>;
  hidden?: string | boolean;
}

// 表单上的组件联合类型：包括SchemaComponent，组件声明
export type FieldUnionType = SchemaComponent | Array<SchemaComponent> | React.ComponentType<any> | Function

export interface BaseFieldProps extends SchemaComponent {
  fieldComponent?: FieldUnionType; // 表单域中的容器组件
  inside?: FieldUnionType;
  outside?: FieldUnionType;
  readOnly?: boolean; // 只读模式
  readOnlyRender?: FieldUnionType | ReactNode; // 只读模式下的组件
  typeRender?: any; // 表单控件自定义渲染
}

// 表单域(绑定表单字段)
export interface FormFieldProps extends Overwrite<FormItemProps, Extension>, BaseFieldProps {
  properties?: { [name: string]: FormFieldProps } | FormFieldProps[]; // 嵌套的表单控件 为对象时表示对象嵌套，为数组类型时表示数组集合
}

// 计算结束的表单域类型
export interface OverwriteFormFieldProps extends FormItemProps, BaseFieldProps {
  properties?: { [name: string]: OverwriteFormFieldProps } | OverwriteFormFieldProps[];
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
  Fields?: typeof defaultFields;
  // 自定义渲染列表
  renderList?: React.ComponentType<GeneratePrams>;
  // 自定义渲染子元素
  renderItem?: React.ComponentType<GeneratePrams>;
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
export interface GeneratePrams { name?: string, field?: OverwriteFormFieldProps, parent?: string, store?: FormRenderStore, children?: any };
