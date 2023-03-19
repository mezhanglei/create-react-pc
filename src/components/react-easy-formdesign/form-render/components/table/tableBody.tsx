import React, { useCallback } from 'react';
import { Classes, TableBodyOptions, TableOptions } from './Table';
import classNames from 'classnames';
import { TableCell } from './cell';
import { TableRow } from './row';

export type TableBodyProps = React.HtmlHTMLAttributes<HTMLTableSectionElement> & TableOptions & TableBodyOptions;

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>((props, ref) => {
  const { dataSource, columns, rowKey, components, className, children, ...rest } = props;
  const { row: CutomRow, col: CustomCol } = components?.head || {};

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
    return columns.map((col, colIndex) => {
      const render = col?.render;
      const child = typeof render == 'function' ? render(record[col.key], record, rowIndex) : record[col.key];
      if (CustomCol) return <CustomCol key={col.key} column={col} record={record} rowIndex={rowIndex} colIndex={colIndex} children={child} />
      return <TableCell key={col.key}>{child}</TableCell>
    })
  };

  const childs = (
    dataSource?.map((record, rowIndex) => {
      const cols = renderCol(record, rowIndex);
      if (CutomRow) {
        return (
          <CutomRow record={record} index={rowIndex}>
            {cols}
          </CutomRow>
        );
      };

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
