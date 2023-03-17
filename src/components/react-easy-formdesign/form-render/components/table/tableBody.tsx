import React from 'react';
import { Classes, ColumnType } from './Table';
import classNames from 'classnames';
import { TableCell } from './cell';
import { TableRow } from './row';

export interface TableBodyProps extends React.HtmlHTMLAttributes<HTMLTableSectionElement> {
  dataSource?: { [x: string]: any }[];
  columns: ColumnType[];
  getRowKey: (record: { [x: string]: any }) => string;
}

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>((props, ref) => {
  const { dataSource, columns, getRowKey, className, children, ...rest } = props;

  const childs = (
    dataSource?.map((record, rowIndex) => (
      <TableRow key={getRowKey(record)}>
        {columns.map((col) => {
          const render = col?.render;
          const child = typeof render == 'function' ? render(record[col.key], record, rowIndex) : record[col.key];
          return <TableCell key={col.key}>{child}</TableCell>
        })}
      </TableRow>
    ))
  );

  return (
    <tbody className={classNames(Classes.TableBody, className)} ref={ref} {...rest}>
      {children ?? childs}
    </tbody>
  );
});
