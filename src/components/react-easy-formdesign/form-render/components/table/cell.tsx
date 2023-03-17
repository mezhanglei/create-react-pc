import React from 'react';
import { Classes } from './Table';
import classNames from 'classnames';
import pickAttrs from "@/utils/pickAttrs";

export interface TableCellProps extends React.HtmlHTMLAttributes<HTMLTableCellElement> {
  componentType?: "th" | "td"
}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>((props, ref) => {
  const {
    children,
    className,
    componentType = "td",
    ...rest
  } = props;

  return React.createElement(
    componentType,
    { className: classNames(Classes.TableCell, className), ref, ...pickAttrs(rest, { aria: true, data: true }) },
    children
  );
});
