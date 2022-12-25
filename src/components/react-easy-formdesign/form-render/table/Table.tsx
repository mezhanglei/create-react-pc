import React, { LegacyRef, useCallback } from "react";
import cx from "classnames";
import './Table.less';
import { ColumnGroup } from "./columnGroup";
import { TableHead } from "./tableHead";
import { TableBody } from "./tableBody";

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
  title: string;
  width?: React.CSSProperties["width"];
  align?: React.CSSProperties["textAlign"];
}

export interface TableProps extends React.HtmlHTMLAttributes<HTMLTableElement> {
  columns: ColumnType[];
  dataSource?: { [x: string]: any }[];
  rowKey?: string | ((record: { [x: string]: any }) => string);
  tableLayout?: React.CSSProperties["tableLayout"];
}

const Table: React.FC<TableProps> = React.forwardRef(({
  columns,
  dataSource,
  className,
  style = {},
  tableLayout,
  rowKey,
  children,
  ...rest
}, ref: LegacyRef<HTMLTableElement>) => {
  const getRowKey = useCallback(
    (record: { [x: string]: any }) => {
      if (typeof rowKey === "function") {
        return rowKey(record);
      }
      let key = typeof rowKey === "string" ? rowKey : "key";
      return record[key] as string;
    },
    [rowKey]
  );

  const childs = (
    <>
      <TableHead columns={columns}></TableHead>
      <TableBody
        getRowKey={getRowKey}
        columns={columns}
        dataSource={dataSource}
      />
    </>
  )

  return (
    <table
      className={cx([Classes.Table, className])}
      style={{ tableLayout: tableLayout, ...style }}
      {...rest}
      ref={ref}
    >
      <ColumnGroup columns={columns} />
      {children ?? childs}
    </table>
  );
});

export default Table;
