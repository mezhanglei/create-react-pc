import React, { useCallback, useMemo } from "react";
import cx from "classnames";
import { Classes, StyledWrapTable } from "./style";

export interface ColumnType {
  key: string;
  title: string;
  width?: React.CSSProperties["width"];
  align?: React.CSSProperties["textAlign"];
}

export interface TableProps {
  columns: ColumnType[];
  className?: string;
  style?: React.CSSProperties;
  dataSource?: { [x: string]: any }[];
  rowKey?: string | ((record: { [x: string]: any }) => string);
  tableLayout?: React.CSSProperties["tableLayout"];
}

const ColumnGroup: React.FC<{ columns: ColumnType[] }> = ({ columns }) => {
  const columnWidths = columns.map((ele) => ele.width).join("-");
  const cols = useMemo(() => {
    let cols: React.ReactElement[] = [];
    let mustInsert = false;
    for (let i = columns.length; i >= 0; i--) {
      const width = columns[i] && columns[i].width;
      if (width || mustInsert) {
        cols.unshift(
          <col
            key={i}
            style={{ width, minWidth: width, textAlign: columns[i].align }}
          />
        );
        mustInsert = true;
      }
    }
    return cols;
    // eslint-disable-next-line
  }, [columnWidths]);
  return <colgroup>{cols}</colgroup>;
};

const TableCell: React.FC<{ componentType?: "th" | "td" }> = ({
  children,
  componentType = "td",
}) => {
  return React.createElement(
    componentType,
    { className: Classes.TableCell },
    children
  );
};

const TableBody: React.FC<{
  dataSource?: { [x: string]: any }[];
  columns: ColumnType[];
  getRowKey: (record: { [x: string]: any }) => string;
}> = ({ dataSource, columns, getRowKey }) => {
  return (
    <tbody className={Classes.TableBody}>
      {dataSource?.map((record) => (
        <tr className={Classes.TableRow} key={getRowKey(record)}>
          {columns.map((cell) => (
            <TableCell key={cell.key}> {record[cell.key]}</TableCell>
          ))}
        </tr>
      ))}
    </tbody>
  );
};

const TableHead: React.FC<{ columns: ColumnType[] }> = ({ columns }) => {
  return (
    <thead className={Classes.TableHead}>
      <tr className={Classes.TableRow}>
        {columns.map((column) => (
          <TableCell key={column.key}>{column.title}</TableCell>
        ))}
      </tr>
    </thead>
  );
};

const Table: React.FC<TableProps> = ({
  columns,
  dataSource,
  className,
  style = {},
  tableLayout,
  rowKey,
}) => {
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
    <StyledWrapTable>
      <table
        className={cx([Classes.Table, className])}
        style={{ tableLayout: tableLayout, ...style }}
      >
        <ColumnGroup columns={columns} />
        <TableHead columns={columns}></TableHead>
        <TableBody
          getRowKey={getRowKey}
          columns={columns}
          dataSource={dataSource}
        />
      </table>
    </StyledWrapTable>
  );
};

export default Table;
