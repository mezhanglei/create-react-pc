import React, { useCallback } from 'react';
import classNames from 'classnames';
import { TableCell, TableRow, Tbody } from './components';
import { Classes, TableBodyOptions, TableOptions } from './formTable';
import { TableProps } from '.';
import { Form } from '../..';

export type TableBodyProps = React.HtmlHTMLAttributes<HTMLTableSectionElement> & TableOptions & TableBodyOptions & TableProps;

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>((props, ref) => {
  const { dataSource, columns, rowKey, className, children, store, ...rest } = props;

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
      const columnControl = store && store.controlInstance(column);
      const child = typeof render == 'function' ? render(record[name], record, rowIndex, colIndex) : (columnControl || record[name]);
      return (
        <Form.Item component={TableCell} name={name} key={name}>
          {child}
        </Form.Item>
      );
    })
  };

  const childs = (
    dataSource?.map((record, rowIndex) => {
      const cols = renderCol(record, rowIndex);
      return (
        <Form.Item component={TableRow} key={getRowKey(record, rowIndex)}>
          {cols}
        </Form.Item>
      );
    })
  );

  return (
    <Form.List component={Tbody} className={classNames(Classes.TableBody, className)} ref={ref} {...rest}>
      {children ?? childs}
    </Form.List>
  );
});
