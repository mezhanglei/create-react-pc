import { FormItemProps, FormProps } from "../react-easy-formcore";
import { defaultFields } from './register';

// 组件的children(不绑定表单字段)
export interface ChildrenComponent {
    component: string, // 组件代表的字符串
    props: { children?: JSX.Element | ChildrenComponent[], [key: string]: any } // 渲染props数组
}

// 表单域(绑定表单字段)
export interface FormFieldProps extends FormItemProps {
    component?: string // 表单控件代表的字符串
    render?: any // 非表单控件，会覆盖表单控件(component等属性)
    hidden?: string | boolean // 隐藏表单域
    path?: string // 当前节点所在的路径
    props?: ChildrenComponent['props'] // 表单控件的属性
    properties?: { [key: string]: FormFieldProps } | FormFieldProps[] // 嵌套组件
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
    widgets: { [key: string]: any }
    Fields: typeof defaultFields
};

