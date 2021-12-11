import { FormItemProps, FormProps } from "../react-easy-formcore";
import { defaultWidgets, defaultFields } from './register';

// 组件的children(不绑定表单字段)
export interface ChildrenComponent {
    component: string, // 组件代表的字符串
    props: { children?: JSX.Element | ChildrenComponent[], [key: string]: any } // 渲染props数组
}

// 表单域(绑定表单字段)
export interface FormFieldProps extends FormItemProps {
    decorator?: 'Form.Item' | 'Form.List' // 表单域对应的组件
    component: string // 表单控件代表的字符串
    props?: ChildrenComponent['props'] // 表单控件的属性
    hidden?: string | boolean // 隐藏表单域
    path?: string // 当前节点所在的路径
    properties?: SchemaData['properties'] | FormFieldProps[] // 嵌套组件
}

export interface RenderFormState {
    hiddenMap: { [key: string]: boolean }
    prevSchema?: SchemaData
}

// schema
export interface SchemaData extends FormProps {
    properties: { [key: string]: FormFieldProps }
}

export interface RenderFormProps extends FormProps {
    schema: SchemaData
    widgets: typeof defaultWidgets
    Fields: typeof defaultFields
};

