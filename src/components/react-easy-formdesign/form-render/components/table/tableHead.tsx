import React from 'react';
import { Classes, TableOptions } from './Table';
import classNames from 'classnames';
import { TableCell } from './cell';
import { TableRow } from './row';

export type TableHeadProps = React.HtmlHTMLAttributes<HTMLTableSectionElement> & TableOptions;

export const TableHead = React.forwardRef<HTMLTableSectionElement, TableHeadProps>((props, ref) => {
  const {
    children,
    className,
    columns,
    components,
    ...rest
  } = props;

  const { row: CutomRow, col: CustomCol } = components?.head || {};

  const childs = (
    columns.map((column, colIndex) => {
      if (CustomCol) {
        return (
          <CustomCol key={column.key} column={column} colIndex={colIndex} />
        )
      }
      return <TableCell key={column.key}>{column.title}</TableCell>
    })
  );

  const renderChils = () => {
    if (CutomRow) return <CutomRow columns={columns} />;
    return (
      <TableRow>
        {children ?? childs}
      </TableRow>
    );
  }

  return (
    <thead className={classNames(Classes.TableHead, className)} ref={ref} {...rest}>
      {renderChils()}
    </thead>
  );
});
