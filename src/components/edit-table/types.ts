

// -- EditTableCol组件

import { CSSProperties } from "react";
import { FormInstance } from 'antd';

// 行的数据基础
export interface RowData {
  key: string;
  [key: string]: unknown
}

// 保存单元格内容的函数类型
export type SaveCellFn = (value: { label: string, [key: string]: any } | string) => Promise<void>;
// 回调操作函数类型
export type CallBackFn = (dataSource: any[], rowData: RowData, col?: any) => any;

// 渲染可编辑控件传递的props
export interface ColumnEditProps extends ColumnProps {
  save: SaveCellFn,
  switchEdit: () => void,
  form: FormInstance;
}

// column渲染可传的参数
export interface ColumnProps {
  title: React.ReactNode; // 列的名
  children?: any; // cell单元格的子元素
  dataIndex: string; // 列的渲染字段
  rowData: RowData; // 行的数据
  handleSave: (rowData: RowData, props?: ColumnProps) => void; // 更新保存
  renderEditCell?: (props: ColumnEditProps, inputRef: any) => any; // 渲染编辑框组件
  editLabelPath?: string, // 编辑单元格的显示字段路径
  extra: (props: ColumnEditProps, inputRef: any) => any; // 单元格内额外的组件
  rules: any[]; // 校验规则, 格式为antd的form的rules校验格式
  editStyle: CSSProperties; // 编辑区域容器的样式
  disabled: boolean | ((...arg: any[]) => boolean); // 是否禁止点击
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
  updateCell: (rowData: RowData, col?: ColumnProps) => any; // 更新
  deleteTableRow: (rowData: RowData) => any; // 删除
  addTableRow: () => any; // 新增
}