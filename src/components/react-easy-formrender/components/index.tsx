import { Form } from "@/components/react-easy-formcore";
import { AddBtn, DeleteBtn } from "./btn";
import { GridCol, GridRow } from "./grid";

// 表单中使用的组件
export const defaultComponents = {
  'row': GridRow,
  'col': GridCol,
  'add': AddBtn,
  'delete': DeleteBtn,
  'Form.Item': Form.Item,
  'Form.List': Form.List,
};
