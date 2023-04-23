import React, { CSSProperties } from "react";
import classnames from "classnames";
import './formTable.less';
import { ColumnGroup } from "./columnGroup";
import { TableHead } from "./tableHead";
import { TableBody } from "./tableBody";
import pickAttrs from "@/utils/pickAttrs";
import { TableProps } from ".";

const prefix = "form-table";
export const Classes = {
  Table: `${prefix}`,
  TableBody: `${prefix}-body`,
  TableRow: `${prefix}-row`,
  TableHead: `${prefix}-head`,
  TableCell: `${prefix}-cell`,
};

export interface ColumnType {
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
  columns: ColumnType[];
}

export interface FormTableProps extends TableOptions, TableBodyOptions, TableProps {
  className?: string;
  style?: CSSProperties;
  tableLayout?: React.CSSProperties["tableLayout"];
}

const FormTable = React.forwardRef<HTMLTableElement, FormTableProps>(({
  columns = [],
  dataSource = [{}, {}],
  rowKey,
  className,
  style = {},
  tableLayout,
  children,
  ...rest
}, ref) => {

  return (
    <table
      className={classnames([Classes.Table, className])}
      style={{ tableLayout: tableLayout, ...style }}
      {...pickAttrs(rest, { aria: true, data: true })}
      ref={ref}
    >
      <ColumnGroup columns={columns} />
      <TableHead columns={columns} />
      <TableBody
        {...rest}
        rowKey={rowKey}
        columns={columns}
        dataSource={dataSource}
        children={children}
      />
    </table>
  );
});

export default FormTable;
