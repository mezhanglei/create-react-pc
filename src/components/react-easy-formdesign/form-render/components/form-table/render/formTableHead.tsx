import React from 'react';
import { Classes, TableOptions } from './formTable';
import classNames from 'classnames';
import { TableCell, TableRow } from './components';
import pickAttrs from "@/utils/pickAttrs";

export type FormTableHeadProps = React.HtmlHTMLAttributes<HTMLTableSectionElement> & TableOptions;

export const FormTableHead = React.forwardRef<HTMLTableSectionElement, FormTableHeadProps>((props, ref) => {
  const {
    children,
    className,
    columns,
    ...rest
  } = props;

  const childs = (
    columns.map((column, colIndex) => {
      return <TableCell key={colIndex}>{column.label}</TableCell>
    })
  );

  const renderChils = () => {
    return (
      <TableRow>
        {children ?? childs}
      </TableRow>
    );
  }

  return (
    <thead className={classNames(Classes.TableHead, className)} ref={ref} {...pickAttrs(rest, { aria: true, data: true })}>
      {renderChils()}
    </thead>
  );
});
