import { Form } from '../react-easy-formcore';
import { ListItem } from '@/components/list-item/base';

// 表单域组件
export const defaultFields: { [key: string]: any } = {
    'Form.Item': Form.Item,
    'Form.List': Form.List,
    'List.Item': ListItem
};
