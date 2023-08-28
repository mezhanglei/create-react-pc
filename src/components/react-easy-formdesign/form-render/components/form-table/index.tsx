import { ColumnsType, TableProps } from 'antd/lib/table';
import React, { CSSProperties } from 'react';
import { GeneratePrams } from '../..';
import { ELementProps } from '../../configs';
import DesignTable from './design/designTable';
import FormTable from './render/formTable';

export interface FormTableProps extends TableProps<any>, GeneratePrams<ELementProps> {
  value?: any;
  onChange?: (val: any) => void;
  minRows?: number; // 表格默认最少行数
  maxRows?: number; // 表格默认最大行数
  disabled?: boolean; // 禁用
  showBtn?: boolean; // 展示或隐藏增减按钮
  columns: CustomColumnType[];
  className?: string;
  style?: CSSProperties;
}

export interface CustomColumnType extends Omit<ColumnsType<any>, 'includes'>, ELementProps {
  key?: string;
  title: string;
  dataIndex: string;
  type?: string;
  props?: any;
  initialValue?: any;
  render?: (val: unknown, record?: unknown, rowIndex?: number, colIndex?: number) => any;
}

const Table = React.forwardRef<any, FormTableProps>((props, ref) => {
  const {
    field,
  } = props;

  const isEditor = field?.isEditor;
  const columns = field?.props?.columns;

  return (
    isEditor ? <DesignTable {...props} columns={columns} ref={ref} /> : <FormTable {...props} ref={ref} columns={columns} />
  );
});

export default Table;
