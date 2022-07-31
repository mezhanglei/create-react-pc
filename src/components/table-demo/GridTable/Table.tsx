import React, { useMemo } from "react";
import cx from "classnames";
import { Classes, StyledWrapTable } from "./style";

const COLUMN_MIN_WIDTH = 60;

export interface ColumnType {
  key: string;
  title: string;
  width?: React.CSSProperties["width"];
  align?: React.CSSProperties["textAlign"];
  flexGrow?: number;
  minWidth?: number;
}

export interface TableProps {
  columns: ColumnType[];
  className?: string;
  style?: React.CSSProperties;
  dataSource?: { [x: string]: any }[];
}

const TableCell: React.FC<{}> = ({ children, ...props }) => {
  return (
    <div className={Classes.TableCell} {...props}>
      {children}
    </div>
  );
};

const TableBody: React.FC<{
  dataSource?: { [x: string]: any }[];
  columns: ColumnType[];
  style?: React.CSSProperties;
  className?: string;
}> = ({ dataSource, columns, className, style }) => {
  return (
    <div
      className={cx([Classes.TableBody, Classes.TableGrid, className])}
      style={style}
    >
      {dataSource?.map((record, i) =>
        columns.map((cell, j) => (
          <TableCell key={`grid-${i}-${j}`} data-grid-position={`(${i}, ${j})`}>
            {record[cell.key]}
          </TableCell>
        ))
      )}
    </div>
  );
};

const TableHead: React.FC<{
  columns: ColumnType[];
  style?: React.CSSProperties;
  className?: string;
}> = ({ columns, className, style }) => {
  return (
    <div
      className={cx([Classes.TableGrid, Classes.TableHead, className])}
      style={style}
    >
      {columns.map((column) => (
        <TableCell key={column.key}>{column.title}</TableCell>
      ))}
    </div>
  );
};

const GridTable: React.FC<TableProps> = ({
  columns,
  dataSource,
  className,
  style = {},
}) => {
  const styles = useMemo(() => {
    let cols: string[] = [];
    columns.forEach((col) => {
      if (col.width && !col.flexGrow) {
        cols.push(`${col.width}px`);
      } else {
        let flexGrow = col.flexGrow ?? 1;
        let minWidth = col.minWidth ?? COLUMN_MIN_WIDTH;
        cols.push(`minmax(${minWidth}px, ${flexGrow}fr)`);
      }
    });
    return { columns: cols.join(" ") };
  }, [columns]);

  return (
    <StyledWrapTable columns={styles.columns}>
      <div className={cx([Classes.Table, className])} style={style}>
        <TableHead columns={columns}></TableHead>
        <TableBody columns={columns} dataSource={dataSource} />
      </div>
    </StyledWrapTable>
  );
};

export default GridTable;
