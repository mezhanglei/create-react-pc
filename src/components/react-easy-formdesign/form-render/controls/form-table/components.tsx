import React from 'react';
import { Classes } from './formTable';
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

export type TableRowProps = React.HtmlHTMLAttributes<HTMLTableRowElement>;

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>((props, ref) => {
  const {
    children,
    className,
    ...rest
  } = props;
  
  return (
    <tr className={classNames(Classes.TableRow, className)} ref={ref} {...pickAttrs(rest, { aria: true, data: true })}>
      {children}
    </tr>
  );
});

export const Tbody = React.forwardRef<HTMLTableSectionElement, React.HtmlHTMLAttributes<HTMLTableSectionElement>>((props, ref) => {
  const {
    children,
    className,
    ...rest
  } = props;
  
  return (
    <tbody className={classNames(Classes.TableRow, className)} ref={ref} {...pickAttrs(rest, { aria: true, data: true })}>
      {children}
    </tbody>
  );
});
