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
  props?: {
    [key: string]: any;
    children?: any | Array<SchemaComponent>
  };
  hidden?: string | boolean;
}

export interface BaseFieldProps extends SchemaComponent {
  category?: string; // 当前节点类型，为container时表示容器节点, 不会组成表单值。
  inside?: SchemaComponent;
  outside?: SchemaComponent;
  readOnly?: boolean; // 只读模式
  readOnlyItem?: string; // 只读模式下的组件，和readOnlyRender只能生效一个，readOnlyRender优先级最高
  readOnlyRender?: any; // 只读模式下的组件，和readOnlyItem只能生效一个，readOnlyRender优先级最高
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
  inside?: SchemaComponent;
  Fields?: typeof defaultFields;
  // 自定义渲染列表
  renderList?: React.ComponentType<GeneratePrams & { children: any }>;
  // 自定义渲染子元素
  renderItem?: React.ComponentType<GeneratePrams & { children: any }>;
}

// 带form容器的渲染组件props
export interface RenderFormProps extends FormProps<FormRenderStore>, BaseRenderProps {
  onSchemaChange?: (newValue: SchemaData, oldValue?: SchemaData) => void;
  schema: SchemaData;
};

// 不带form容器的渲染组件props
export interface RenderFormChildrenProps extends BaseRenderProps {
  onPropertiesChange?: (newValue: SchemaData['properties'], oldValue?: SchemaData['properties'], index?: number) => void;
  properties?: SchemaData['properties']; // 控件数据源的数据
};

export type ValueOf<T> = T[keyof T];
// 表单节点信息
export interface FormItemInfo { name?: string, field: OverwriteFormFieldProps, path?: string };
// 生成组件的传递的参数
export interface GeneratePrams extends FormItemInfo { store?: FormRenderStore };
// 返回列表
export type getChildrenList = (generate: generateChildFunc, parent?: FormItemInfo) => any;
export type generateChildFunc = (params: FormItemInfo) => JSX.Element | undefined;
