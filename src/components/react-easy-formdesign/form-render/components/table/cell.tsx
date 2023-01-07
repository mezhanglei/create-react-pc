import React, { LegacyRef } from 'react';
import { Classes } from './Table';
import classNames from 'classnames';

export interface TableCellProps extends React.HtmlHTMLAttributes<HTMLTableCellElement> {
  componentType?: "th" | "td"
}

export const TableCell: React.FC<TableCellProps> = React.forwardRef((props, ref: LegacyRef<HTMLTableCellElement>) => {
  const {
    children,
    className,
    componentType = "td",
    ...rest
  } = props;

  return React.createElement(
    componentType,
    { className: classNames(Classes.TableCell, className), ref, ...rest },
    children
  );
});
