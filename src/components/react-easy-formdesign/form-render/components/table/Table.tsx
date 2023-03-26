import React, { CSSProperties } from "react";
import classnames from "classnames";
import './Table.less';
import { ColumnGroup } from "./columnGroup";
import { TableHead } from "./tableHead";
import { TableBody } from "./tableBody";
import pickAttrs from "@/utils/pickAttrs";

const prefix = "r-";
export const Classes = {
  Table: `${prefix}table`,
  TableBody: `${prefix}table-body`,
  TableRow: `${prefix}table-row`,
  TableHead: `${prefix}table-head`,
  TableCell: `${prefix}table-cell`,
};

export interface ColumnType {
  key: string;
  name: string;
  title: string;
  width?: React.CSSProperties["width"];
  align?: React.CSSProperties["textAlign"];
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

export interface TableProps extends React.HtmlHTMLAttributes<HTMLTableElement>, TableOptions, TableBodyOptions {
  className?: string;
  style?: CSSProperties;
  tableLayout?: React.CSSProperties["tableLayout"];
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(({
  columns = [],
  dataSource,
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
        rowKey={rowKey}
        columns={columns}
        dataSource={dataSource}
        children={children}
      />
    </table>
  );
});

export default Table;
