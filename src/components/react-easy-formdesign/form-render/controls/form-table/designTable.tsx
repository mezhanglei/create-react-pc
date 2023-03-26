import React, { CSSProperties } from "react";
import classnames from "classnames";
import './designTable.less';
import pickAttrs from "@/utils/pickAttrs";
import { TableOptions } from "./formTable";
import { TableProps } from ".";
import ColumnSelection from "./column-selection";
import TableDnd from './dnd';
import { joinFormPath } from "../..";

export interface DesignTableProps extends TableOptions, TableProps {
  className?: string;
  style?: CSSProperties;
}

const DesignTable = React.forwardRef<HTMLTableElement, DesignTableProps>(({
  columns = [],
  className,
  style,
  name,
  parent,
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

  const currentPath = joinFormPath(parent, name);

  return (
    <div
      className={classnames([Classes.Table, className])}
      {...pickAttrs(rest, { aria: true, data: true })}
      style={style}
      ref={ref}>
      <TableDnd {...rest}>
        {
          columns?.map((column, colIndex) => {
            return (
              <div className={Classes.TableCol} key={colIndex}>
                <ColumnSelection parent={currentPath} name={column?.name} field={column} colIndex={colIndex}>
                  <div className={Classes.TableColHead}>
                    111111111111
                  </div>
                  <div className={Classes.TableColBody}>
                    <input />
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
