import React, { LegacyRef } from 'react';
import { Classes } from './Table';
import classNames from 'classnames';
import pickAttrs from "@/utils/pickAttrs";

export interface TableRowProps extends React.HtmlHTMLAttributes<HTMLTableRowElement> {
}

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
