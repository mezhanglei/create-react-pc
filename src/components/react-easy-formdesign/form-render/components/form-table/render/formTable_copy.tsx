import React, { CSSProperties, useCallback } from "react";
import classnames from "classnames";
import './formTable.less';
import { ColumnGroup } from "./columnGroup";
import pickAttrs from "@/utils/pickAttrs";
import { TableProps } from "..";
import { TableBody, TableCell, TableHead, TableRow } from "./components";
import { Form, useFormStore } from "../../..";
import { ELementProps } from "@/components/react-easy-formdesign/form-designer/components/configs";

const prefix = "form-table";
export const Classes = {
  Table: `${prefix}`,
  TableBody: `${prefix}-body`,
  TableRow: `${prefix}-row`,
  TableHead: `${prefix}-head`,
  TableCell: `${prefix}-cell`,
};

export interface CustomColumnType {
  key: string;
  name: string;
  label: string;
  width?: React.CSSProperties["width"];
  align?: React.CSSProperties["textAlign"];
  type?: string;
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

const FormTable = React.forwardRef<HTMLTableElement, FormTableProps>(({
  columns = [],
  dataSource = [{},{}],
  rowKey,
  className,
  style = {},
  tableLayout,
  children,
  formrender,
  name,
  path,
  field,
  parent,
  value,
  onChange,
  ...rest
}, ref) => {

  const getRowKey = useCallback(
    (record: { [x: string]: any }, rowIndex: number) => {
      if (typeof rowKey === "function") {
        return rowKey(record);
      }
      let key = typeof rowKey === "string" ? rowKey : "key";
      return record[key] || rowIndex;
    },
    [rowKey]
  );

  const form = useFormStore();

  const onFieldsChange: ELementProps['onFieldsChange'] = (_, values) => {
    onChange && onChange(values);
  }

  return (
    <Form form={form} tagName="div" initialValues={{ name: value }} onFieldsChange={onFieldsChange}>
      <table
        className={classnames([Classes.Table, className])}
        style={{ tableLayout: tableLayout, ...style }}
        {...pickAttrs(rest)}
        ref={ref}
      >
        <ColumnGroup columns={columns} />
        <TableHead>
          <TableRow>
            {columns.map((column) => {
              return <TableCell key={column.name}>{column.label}</TableCell>
            })}
          </TableRow>
        </TableHead>
        <Form.List component={TableBody}>
          {dataSource?.map((record, rowIndex) => {
            return (
              <Form.Item component={TableRow} key={getRowKey(record, rowIndex)}>
                {columns.map((column, colIndex) => {
                  const { render, name } = column || {};
                  const columnInstance = formrender && formrender.componentInstance(column);
                  const child = typeof render == 'function' ? render(record[name], record, rowIndex, colIndex) : (columnInstance || record[name]);
                  return (
                    <Form.Item component={TableCell} name={name} key={name}>
                      {child}
                    </Form.Item>
                  );
                })}
              </Form.Item>
            )
          })}
        </Form.List>
      </table>
    </Form>
  );
});

export default FormTable;
