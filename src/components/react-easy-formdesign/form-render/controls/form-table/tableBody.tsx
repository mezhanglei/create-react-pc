import React, { useCallback } from 'react';
import classNames from 'classnames';
import { TableCell } from './cell';
import { TableRow } from './row';
import { Classes, TableBodyOptions, TableOptions } from './formTable';

export type TableBodyProps = React.HtmlHTMLAttributes<HTMLTableSectionElement> & TableOptions & TableBodyOptions;

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>((props, ref) => {
  const { dataSource, columns, rowKey, className, children, ...rest } = props;

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

  const renderCol = (record: any, rowIndex: number) => {
    return columns.map((column, colIndex) => {
      const { render, key } = column || {};
      const child = typeof render == 'function' ? render(record[key], record, rowIndex, colIndex) : record[key];
      return <TableCell key={key}>{child}</TableCell>
    })
  };

  const childs = (
    dataSource?.map((record, rowIndex) => {
      const cols = renderCol(record, rowIndex);
      return (
        <TableRow key={getRowKey(record)}>
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
