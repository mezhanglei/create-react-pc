import { ColumnType, TableProps } from "antd/lib/table";
import { CSSProperties } from "react";
import { FormNodeProps } from "@simpleform/render";

export interface FormTableProps extends TableProps<any> {
  minRows?: number; // 表格默认最少行数
  maxRows?: number; // 表格默认最大行数
  disabled?: boolean; // 禁用
  showBtn?: boolean; // 展示或隐藏增减按钮
  columns: CustomColumnType[];
  className?: string;
  style?: CSSProperties;
}

export interface CustomColumnType<T = any> extends ColumnType<T>, FormNodeProps {
  initialValue?: any;
  renderFormItem?: (val: unknown, record?: unknown, rowIndex?: number, colIndex?: number) => any;
}
