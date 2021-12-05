import { FormFieldProps, FormProps } from "../react-easy-formcore";

// 传入表单的类型
export enum SchemaType {
    Object = 'object', // 对象类型
    Array = 'array'
}

export interface FieldProps extends FormFieldProps {
    children?: { [key: string]: FieldProps | FieldProps[] }
}

export type Properties = { [key: string]: FieldProps | FieldProps[] }

export interface SchemaData extends FormProps {
    properties: Properties[] | Properties[]
}

export interface RenderFromProps extends FormProps {
    schema: SchemaData
};

export interface RenderFromState {

}
