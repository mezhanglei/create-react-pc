import React, { LegacyRef } from 'react';
import { Classes } from './Table';
import classNames from 'classnames';

export interface TableRowProps extends React.HtmlHTMLAttributes<HTMLTableRowElement> {
}

export const TableRow: React.FC<TableRowProps> = React.forwardRef((props, ref: LegacyRef<HTMLTableRowElement>) => {
  const {
    children,
    className,
    ...rest
  } = props;
  return (
    <tr className={classNames(Classes.TableRow, className)} ref={ref} {...rest}>
      {children}
    </tr>
  );
});