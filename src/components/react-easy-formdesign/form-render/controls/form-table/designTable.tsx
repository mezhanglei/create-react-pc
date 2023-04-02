import React, { CSSProperties } from "react";
import classnames from "classnames";
import './designTable.less';
import pickAttrs from "@/utils/pickAttrs";
import { TableProps } from ".";
import ColumnSelection from "./column-selection";
import TableDnd from './dnd';
import { ELementProps } from "@/components/react-easy-formdesign/form-designer/components/configs";

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
  };

  return (
    <div
      className={classnames([Classes.Table, className])}
      {...pickAttrs(rest, { aria: true, data: true })}
      style={style}
      ref={ref}>
      <TableDnd {...rest}>
        {
          columns?.map((column, colIndex) => {
            const columnControl = rest?.store && rest.store.controlInstance(column);
            return (
              <div className={Classes.TableCol} key={colIndex}>
                <ColumnSelection {...rest} colIndex={colIndex}>
                  <div className={Classes.TableColHead}>
                    {column?.label}
                  </div>
                  <div className={Classes.TableColBody}>
                    {columnControl}
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
