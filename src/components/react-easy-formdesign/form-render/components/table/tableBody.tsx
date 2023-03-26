import React, { useCallback } from 'react';
import { Classes, TableBodyOptions, TableOptions } from './Table';
import classNames from 'classnames';
import { TableCell } from './cell';
import { TableRow } from './row';

export type TableBodyProps = React.HtmlHTMLAttributes<HTMLTableSectionElement> & TableOptions & TableBodyOptions;

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>((props, ref) => {
  const { dataSource, columns, rowKey, className, children, ...rest } = props;

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
    dataSource?.map((record, rowIndex) => {
      const cols = renderCol(record, rowIndex);
      return (
        <TableRow key={getRowKey(record, rowIndex)}>
          {cols}
        </TableRow>
      );
    })
  );

  return (
    <tbody className={classNames(Classes.TableBody, className)} ref={ref} {...rest}>
      {children ?? childs}
    </tbody>
  );
});
