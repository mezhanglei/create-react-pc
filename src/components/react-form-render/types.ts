import { FormItemProps, FormProps } from "../react-easy-formcore";

// 表单控件
export interface FormFieldProps extends FormItemProps {
    decorator: 'Form.Item' | 'Form.List' // 使用的是数组还是对象
    component: string // 组件代表的字符串
    props: any // 自定义组件的其他属性
    properties: FormFieldProps // 嵌套组件
}

// schema属性
export interface SchemaData extends FormProps {
    properties: {
        [key: string]: FormFieldProps
    }
}

// 渲染组件的传值
export interface RenderFormProps extends FormProps {
    schema: SchemaData
};

