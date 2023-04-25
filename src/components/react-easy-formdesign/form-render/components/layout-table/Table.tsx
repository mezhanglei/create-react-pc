import React, { CSSProperties, useCallback } from "react";
import classnames from "classnames";
import './Table.less';
import { ColumnGroup } from "./columnGroup";
import pickAttrs from "@/utils/pickAttrs";
import { TableBody, TableCell, TableHead, TableRow } from "./components";

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

  const renderCol = (record: any, rowIndex: number) => {
    return columns.map((column, colIndex) => {
      const { render, name } = column || {};
      const child = typeof render == 'function' ? render(record[name], record, rowIndex, colIndex) : record[name];
      return <TableCell key={name}>{child}</TableCell>
    })
  };

  const childs = (
    <TableBody>
      {dataSource?.map((record, rowIndex) => {
        const cols = renderCol(record, rowIndex);
        return (
          <TableRow key={getRowKey(record, rowIndex)}>
            {cols}
          </TableRow>
        );
      })}
    </TableBody>
  )

  return (
    <table
      className={classnames([Classes.Table, className])}
      style={{ tableLayout: tableLayout, ...style }}
      {...pickAttrs(rest, { aria: true, data: true })}
      ref={ref}
    >
      <ColumnGroup columns={columns} />
      <TableHead>
        <TableRow>
          {columns.map((column, colIndex) => {
            return <TableCell key={column.key}>{column.title}</TableCell>
          })}
        </TableRow>
      </TableHead>
      {children ?? childs}
    </table>
  );
});

export default Table;
