import { Button, Checkbox, Input, Radio, Select } from 'antd';
import { Form } from '../react-easy-formcore';

// 原子组件
export const defaultWidgets: { [key: string]: any } = {
    input: Input,
    select: Select,
    radioGroup: Radio.Group,
    radio: Radio,
    option: Select.Option,
    button: Button,
    Checkbox: Checkbox
};

// 表单域组件
export const defaultFields: { [key: string]: any } = {
    'Form.Item': Form.Item,
    'Form.List': Form.List
};

export const ComponentType = Object.keys(defaultWidgets);
