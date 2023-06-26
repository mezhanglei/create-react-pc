import React from "react";
import classnames from "classnames";
import './designTable.less';
import pickAttrs from "@/utils/pickAttrs";
import ColumnSelection from "./column-selection";
import TableDnd from './dnd';
import { FormTableProps } from "..";

const DesignTable = React.forwardRef<HTMLTableElement, FormTableProps>(({
  columns = [],
  disabled,
  className,
  style,
  value,
  onChange,
  ...rest
}, ref) => {

  const prefix = "design-table";
  const Classes = {
    Table: prefix,
    TableBody: `${prefix}-body`,
    TableCol: `${prefix}-col`,
    TableSelection: `${prefix}-selection`,
    TableColHead: `${prefix}-col__head`,
    TableColBody: `${prefix}-col__body`,
    TableDnd: `${prefix}-dnd`,
    placeholder: `${prefix}-placeholder`,
  };

  const params = {
    name: rest?.name,
    path: rest?.path,
    field: rest?.field,
    parent: rest?.parent,
    formrender: rest?.formrender,
    form: rest?.form,
  }

  return (
    <div
      className={classnames([Classes.Table, className])}
      {...pickAttrs(rest)}
      style={style}
      ref={ref}>
      <TableDnd  {...rest}>
        {
          columns?.map((column, colIndex) => {
            const columnInstance = rest?.formrender && rest.formrender.componentInstance({ type: column?.type, props: Object.assign({ disabled }, column?.props) });
            return (
              <ColumnSelection key={colIndex} className={Classes.TableSelection} {...params} column={column} colIndex={colIndex}>
                <div className={Classes.TableCol}>
                  <div className={Classes.TableColHead}>
                    {column?.title}
                  </div>
                  <div className={Classes.TableColBody}>
                    {column?.hidden === true ? null : columnInstance}
                  </div>
                </div>
              </ColumnSelection>
            )
          })
        }
      </TableDnd>
      {!columns?.length && <span className={Classes.placeholder}>将控件拖拽到此处</span>}
    </div>
  );
});

export default DesignTable;
