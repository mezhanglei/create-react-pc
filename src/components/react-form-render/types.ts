import { FormProps } from "../react-easy-formcore";

// 传入表单的类型
export enum SchemaType {
    FORM = 'form', // 表单类型
    TEXT = 'text' // 文本类型，只展示
}

export interface SchemaData {
    type: SchemaType
}

export interface RenderFromProps extends FormProps {
    schema: SchemaData
};
