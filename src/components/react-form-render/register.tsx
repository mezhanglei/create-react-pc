import { Button, Input, Select } from 'antd';
import { Form } from '../react-easy-formcore';

// 原子组件
export const ComponentsMap: { [key: string]: any } = {
    input: Input,
    select: Select,
    option: Select.Option,
    button: Button
};

// 容器组件
export const FormFieldMap: { [key: string]: any } = {
    'Form.Item': Form.Item,
    'Form.List': Form.List
};

export const ComponentType = Object.keys(ComponentsMap);
