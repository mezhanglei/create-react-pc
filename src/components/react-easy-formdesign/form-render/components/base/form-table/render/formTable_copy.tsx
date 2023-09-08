import React, { useCallback } from "react";
import classnames from "classnames";
import './formTable.less';
import { ColumnGroup } from "./columnGroup";
import pickAttrs from "@/utils/pickAttrs";
import { TableBody, TableCell, TableHead, TableRow } from "./components";
import { FormTableProps } from "..";
import { Form, joinFormPath, useFormStore, } from '../../../../';
import { ELementProps } from "@/components/react-easy-formdesign/form-render/configs";

const prefix = "form-table";
export const Classes = {
  Table: `${prefix}`,
  TableBody: `${prefix}-body`,
  TableRow: `${prefix}-row`,
  TableHead: `${prefix}-head`,
  TableCell: `${prefix}-cell`,
};

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
              return <TableCell key={column.dataIndex}>{column.title}</TableCell>
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {dataSource?.map((record, rowIndex) => {
            return (
              <TableRow key={getRowKey(record, rowIndex)}>
                {columns.map((column, colIndex) => {
                  const { render, dataIndex } = column || {};
                  const columnInstance = formrender && formrender.componentInstance(column);
                  const child = typeof render == 'function' ? render(record[dataIndex], record, rowIndex, colIndex) : (columnInstance || record[dataIndex]);
                  const joinPath = joinFormPath(rowIndex, dataIndex);
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
