import React, { CSSProperties, useCallback } from "react";
import classnames from "classnames";
import './formTable.less';
import { ColumnGroup } from "./columnGroup";
import pickAttrs from "@/utils/pickAttrs";
import { TableProps } from "..";
import { TableBody, TableCell, TableHead, TableRow } from "./components";
import { Form, joinFormPath, useFormStore } from "../../..";
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

export interface FormTableProps extends TableProps {
  columns: CustomColumnType[];
  dataSource?: { [x: string]: any }[];
  rowKey?: string | ((record: { [x: string]: any }) => string);
  tableLayout?: React.CSSProperties["tableLayout"];
  className?: string;
  style?: CSSProperties;
}

const FormTable = React.forwardRef<HTMLTableElement, FormTableProps>(({
  columns = [],
  dataSource = [{}, {}],
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
    <Form form={form} tagName="div" initialValues={value} onFieldsChange={onFieldsChange}>
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
        <TableBody>
          {dataSource?.map((record, rowIndex) => {
            return (
              <TableRow key={getRowKey(record, rowIndex)}>
                {columns.map((column, colIndex) => {
                  const { render, name } = column || {};
                  const columnInstance = formrender && formrender.componentInstance(column);
                  const child = typeof render == 'function' ? render(record[name], record, rowIndex, colIndex) : (columnInstance || record[name]);
                  const joinPath = joinFormPath(rowIndex, name);
                  return (
                    <Form.Item component={TableCell} name={joinPath} key={joinPath}>
                      {child}
                    </Form.Item>
                  );
                })}
              </TableRow>
            )
          })}
        </TableBody>
      </table>
    </Form>
  );
});

export default FormTable;
