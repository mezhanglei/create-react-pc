import React, { CSSProperties } from "react";
import classnames from "classnames";
import './designTable.less';
import pickAttrs from "@/utils/pickAttrs";
import ColumnSelection from "./column-selection";
import TableDnd from './dnd';
import { ELementProps } from "@/components/react-easy-formdesign/form-designer/components/configs";
import { TableProps } from "..";

export type DesignColumn = ELementProps;
export interface DesignTableProps extends TableProps {
  className?: string;
  style?: CSSProperties;
  columns?: DesignColumn[];
}

const DesignTable = React.forwardRef<HTMLTableElement, DesignTableProps>(({
  columns = [],
  className,
  style,
  ...rest
}, ref) => {

  const prefix = "design-table";
  const Classes = {
    Table: prefix,
    TableBody: `${prefix}-body`,
    TableCol: `${prefix}-col`,
    TableColHead: `${prefix}-col__head`,
    TableColBody: `${prefix}-col__body`,
    TableDnd: `${prefix}-dnd`,
  };

  return (
    <div
      className={classnames([Classes.Table, className])}
      {...pickAttrs(rest)}
      style={style}
      ref={ref}>
      <TableDnd  {...rest}>
        {
          columns?.map((column, colIndex) => {
            const columnInstance = rest?.store && rest.store.componentInstance({ type: column?.type, props: column?.props });
            return (
              <div className={Classes.TableCol} key={colIndex}>
                <ColumnSelection {...rest} column={column} colIndex={colIndex}>
                  <div className={Classes.TableColHead}>
                    {column?.label}
                  </div>
                  <div className={Classes.TableColBody}>
                    {columnInstance}
                  </div>
                </ColumnSelection>
              </div>
            )
          })
        }
      </TableDnd>
    </div>
  );
});

export default DesignTable;
