import React, { CSSProperties } from "react";
import classnames from "classnames";
import './designTable.less';
import pickAttrs from "@/utils/pickAttrs";
import { TableOptions } from "./formTable";
import { TableProps } from ".";

export interface DesignTableProps extends TableOptions, TableProps {
  className?: string;
  style?: CSSProperties;
}

const DesignTable = React.forwardRef<HTMLTableElement, DesignTableProps>(({
  columns = [{},{},{},{},{},{},{},{},{},{},],
  className,
  children,
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
      ref={ref}>
        {
          columns?.map((column, colIndex) => {
            return (
            <div className={Classes.TableCol}>
              <div className={Classes.TableColHead}>
                111111111111
              </div>
              <div className={Classes.TableColBody}>
                <input />
              </div>
            </div>)
          })
        }
    </div>
  );
});

export default DesignTable;
