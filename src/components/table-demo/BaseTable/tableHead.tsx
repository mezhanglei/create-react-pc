import React, { LegacyRef } from 'react';
import { Classes, ColumnType } from './Table';
import classNames from 'classnames';
import { TableCell } from './cell';
import { TableRow } from './row';

export interface TableHeadProps extends React.HtmlHTMLAttributes<HTMLTableSectionElement> {
  columns: ColumnType[]
}

export const TableHead: React.FC<TableHeadProps> = React.forwardRef((props, ref: LegacyRef<HTMLTableSectionElement>) => {
  const {
    children,
    className,
    columns,
    ...rest
  } = props;
  const childs = (
    columns.map((column) => (
      <TableCell key={column.key}>{column.title}</TableCell>
    ))
  );
  return (
    <thead className={classNames(Classes.TableHead, className)} ref={ref} {...rest}>
      <TableRow>
        {children ?? childs}
      </TableRow>
    </thead>
  );
});
