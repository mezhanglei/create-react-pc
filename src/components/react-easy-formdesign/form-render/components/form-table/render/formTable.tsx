import React, { CSSProperties, useMemo } from "react";
import { Table } from "antd";
import pickAttrs from "@/utils/pickAttrs";
import { TableProps } from "..";
import { TableBody, TableCell, TableRow } from "./components";
import { Form, useFormStore } from "../../..";
import classNames from 'classnames';
import './formTable.less';
import { ELementProps } from "@/components/react-easy-formdesign/form-designer/components/configs";

export interface CustomColumnType {
  key: string;
  name: string;
  label: string;
  type?: string;
  props?: any;
  render?: (val: unknown, record?: unknown, rowIndex?: number, colIndex?: number) => any;
}

export type UnionComponent<P> =
  | React.ComponentType<P>
  | React.ForwardRefExoticComponent<P>
  | React.FC<P>
  | keyof React.ReactHTML;

export type TableBodyOptions = {
  dataSource?: { [x: string]: any }[];
  rowKey?: string | ((record: { [x: string]: any }) => string);
}

export type TableOptions = {
  columns: CustomColumnType[];
}

export interface FormTableProps extends TableOptions, TableBodyOptions, TableProps {
  className?: string;
  style?: CSSProperties;
  tableLayout?: React.CSSProperties["tableLayout"];
}

const CustomTableRow = (props: any) => {
  const { children, ...restProps } = props;
  return (
    <Form.Item component={TableRow} {...restProps}>
      {children}
    </Form.Item>
  );
}

const CustomTableCell = (props: any) => {
  const { name, store, type, props: typeProps, children, ...restProps } = props;
  const columnInstance = store && store.componentInstance({ type, props: typeProps });
  return (
    <Form.Item component={TableCell} name={name} key={name} {...restProps}>
      {columnInstance || children}
    </Form.Item>
  );
}

const CustomTableBody = (props: any) => {
  const { children, ...restProps } = props;
  return (
    <Form.List component={TableBody} {...restProps}>
      {children}
    </Form.List>
  )
}

const FormTable = React.forwardRef<HTMLTableElement, FormTableProps>((props, ref) => {
  const {
    className,
    columns = [],
    dataSource = [{}],
    store,
    name,
    path,
    field,
    parent,
    value,
    onChange,
    ...rest
  } = props

  const newColumns = useMemo(() => columns?.map((col) => {
    const { name, label, type, props: typeProps, ...restCol } = col;
    return {
      ...restCol,
      dataIndex: name,
      title: label,
      onCell: (record: unknown) => ({
        record,
        name: name,
        title: label,
        store: store,
        type: type,
        props: typeProps,
      }),
    }
  }), [columns]);

  const form = useFormStore();

  const onFieldsChange: ELementProps['onFieldsChange'] = (_, values) => {
    onChange && onChange(values);
  }

  return (
    <Form store={form} tagName="div" initialValues={{ name: value }} onFieldsChange={onFieldsChange}>
      <Table
        className={classNames('form-table', className)}
        columns={newColumns}
        dataSource={dataSource}
        ref={ref}
        rowKey="key"
        components={{ body: { wrapper: CustomTableBody, row: CustomTableRow, cell: CustomTableCell } }}
        {...pickAttrs(rest)} />
    </Form>
  );
});

export default FormTable;
