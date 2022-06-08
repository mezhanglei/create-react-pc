import { Form, ListItem } from '../react-easy-formcore';
import Button from './slot-widgets/button';

// === 内置组件

// 表单域组件
export const defaultFields = {
  'Form.Item': Form.Item,
  'Form.List': Form.List,
  'List.Item': ListItem
};

// 插槽组件
export const defaultSlotWidgets = {
  'Button': Button
}
