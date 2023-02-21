import React, { CSSProperties, LegacyRef, useCallback } from "react";
import cx from "classnames";
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
  title: string;
  width?: React.CSSProperties["width"];
  align?: React.CSSProperties["textAlign"];
  render?: (val: unknown, record?: unknown, index?: number) => any;
}

export interface TableProps {
  className?: string;
  style?: CSSProperties;
  columns?: ColumnType[];
  dataSource?: { [x: string]: unknown }[];
  rowKey?: string | ((record: { [x: string]: any }) => string);
  tableLayout?: React.CSSProperties["tableLayout"];
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(({
  columns = [],
  dataSource,
  className,
  style = {},
  tableLayout,
  rowKey,
  children,
  ...rest
}, ref) => {
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

  return (
    <table
      className={cx([Classes.Table, className])}
      style={{ tableLayout: tableLayout, ...style }}
      {...pickAttrs(rest, { aria: true, data: true })}
      ref={ref}
    >
      <ColumnGroup columns={columns} />
      <TableHead columns={columns}></TableHead>
      <TableBody
        getRowKey={getRowKey}
        columns={columns}
        dataSource={dataSource}
        children={children}
      />
    </table>
  );
});

export default Table;
