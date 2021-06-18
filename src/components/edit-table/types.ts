

// -- EditTableCol组件

import { CSSProperties } from "react";

// 保存后的record
export interface SaveAfterRecord {
  key: string;
  fullData: object; // 完整的数据
  [propName: string]: any;
}

// 保存单元格内容的函数类型
export type SaveCellFn = (value: { label: string, [key: string]: any } | string) => Promise<void>;
// 回调操作函数类型
export type CallBackFn = (dataSource: any[], record: SaveAfterRecord, col?: any) => any;

// 渲染可编辑控件传递的props
export interface RenderProps extends ColumnProps {
  save: SaveCellFn,
  switchEdit: () => void,
  form: any;
}  

// column渲染可传的参数
export interface ColumnProps {
  title: React.ReactNode; // 列的名
  editing: boolean; // 正常情况单元格为普通div占位，只有点击时才会切换成可编辑控件，这里可以控制是否直接初始化显示可编辑控件
  children?: any; // cell单元格的子元素
  dataIndex: string; // 列的渲染字段
  record: SaveAfterRecord; // 行的数据
  handleSave: (record: SaveAfterRecord) => void; // 更新保存
  renderEditCell?: (props: RenderProps, inputRef: any) => any; // 渲染编辑框组件
  rules: any[]; // 校验规则, 格式为antd的form的rules校验格式
  editStyle: CSSProperties; // 编辑区域容器的样式
  disabled: boolean | ((...arg: any[]) => boolean); // 是否禁止点击
  extra: (props: RenderProps, inputRef: any) => any; // 单元格内额外的组件
  [propName: string]: any;
}

// -- EditTableRow组件

// 自定义行
export interface EditableRowProps {
  index: number;
}

// -- EditTable组件

// table组件的props
export interface EditTableProps {
  form?: any; // 外部表单容器，如果需要则传（目前不需要）
  onChange?: CallBackFn; // 表格的onChange事件
  onSave?: CallBackFn; // 表格的保存事件
  onDelete?: CallBackFn; // 表格的删除事件
  value?: any[]; // value，用来给组件赋值
  columns: any[]; // columns渲染列
  className?: string; // 类名
  [propName: string]: any;
}

// table实例方法
export interface EditTableRef {
  updateCell: (record: any, col?: any) => any; // 更新
  deleteTableRow: (record: any) => any; // 删除
  addTableRow: () => any; // 新增
}