import React from "react";
import classnames from "classnames";
import './index.less';
import pickAttrs from "@/utils/pickAttrs";
import ColumnSelection from "./column-selection";
import TableDnd from './dnd';
import { FormTableProps } from "..";
import { Form } from "../../..";
import { updateEditorFormItem } from "@/components/react-easy-formdesign/render/utils/utils";

const EditorTable = React.forwardRef<HTMLTableElement, FormTableProps>(({
  columns = [],
  disabled,
  className,
  style,
  name,
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

  const columnProps = {
    path: rest?.path,
    field: rest?.field,
    parent: rest?.parent,
    formrender: rest?.formrender,
    form: rest?.form,
  }

  const { editor, settingForm } = rest?.field?.context || {};

  const onFieldsChange = (colIndex: number, newVal: any) => {
    // 设置初始值
    setTimeout(() => {
      // 表单记录下新的initialValue值
      updateEditorFormItem(editor, { initialValue: newVal }, rest?.path, `props.columns[${colIndex}]`);
      // 回填setting表单的intialValue选项
      settingForm?.setFieldValue('initialValue', newVal);
    }, 0);
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
              <ColumnSelection key={column?.dataIndex} className={Classes.TableSelection} {...columnProps} column={column} colIndex={colIndex}>
                <div className={Classes.TableCol}>
                  <div className={Classes.TableColHead}>
                    {column?.title}
                  </div>
                  <div className={Classes.TableColBody}>
                    {column?.hidden === true ? null :
                      <Form.Item name={column?.dataIndex} onFieldsChange={({ value }) => onFieldsChange(colIndex, value)}>
                        {columnInstance}
                      </Form.Item>
                    }
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

export default EditorTable;
