import React, { LegacyRef } from 'react';
import { Classes, ColumnType } from './Table';
import classNames from 'classnames';
import { TableCell } from './cell';
import { TableRow } from './row';

export interface TableBodyProps extends React.HtmlHTMLAttributes<HTMLTableSectionElement> {
  dataSource?: { [x: string]: any }[];
  columns: ColumnType[];
  getRowKey: (record: { [x: string]: any }) => string;
}

export const TableBody: React.FC<TableBodyProps> = React.forwardRef((props, ref: LegacyRef<HTMLTableSectionElement>) => {
  const { dataSource, columns, getRowKey, className, children, ...rest } = props;

  const childs = (
    dataSource?.map((record) => (
      <TableRow key={getRowKey(record)}>
        {columns.map((cell) => (
          <TableCell key={cell.key}> {record[cell.key]}</TableCell>
        ))}
      </TableRow>
    ))
  );

  return (
    <tbody className={classNames(Classes.TableBody, className)} ref={ref} {...rest}>
      {children ?? childs}
    </tbody>
  );
});
