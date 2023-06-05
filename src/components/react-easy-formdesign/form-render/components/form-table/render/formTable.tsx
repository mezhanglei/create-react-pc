import React, { CSSProperties, useMemo } from "react";
import { Button, message, Table, TableProps } from "antd";
import pickAttrs from "@/utils/pickAttrs";
import { TableCell } from "./components";
import { Form, GeneratePrams, joinFormPath, useFormStore } from "../../..";
import classNames from 'classnames';
import './formTable.less';
import { ELementProps } from "@/components/react-easy-formdesign/form-designer/components/configs";
import { useTableData } from "@/components/react-easy-formdesign/utils/hooks";
import { defaultGetId } from "@/components/react-easy-formdesign/utils/utils";
import Icon from '@/components/svg-icon';
import { ColumnsType } from "antd/lib/table";

export interface CustomColumnType extends ColumnsType<any> {
  key: string;
  name: string;
  label: string;
  type?: string;
  props?: any;
  initialValue?: any;
}

export interface FormTableProps extends TableProps<any>, GeneratePrams<ELementProps> {
  value?: any;
  onChange?: (val: any) => void;
  minRows?: number; // 表格默认最少行数
  maxRows?: number; // 表格默认最大行数
  disabled?: boolean; // 禁用
  showBtn?: boolean; // 展示或隐藏增减按钮
  columns: CustomColumnType[];
  className?: string;
  style?: CSSProperties;
}

const CustomTableCell = (props: any) => {
  const { name, formrender, type, props: typeProps, hidden, children, ...restProps } = props;
  const columnInstance = formrender && formrender.componentInstance({ type, props: typeProps });
  return (
    <Form.Item component={TableCell} name={name} key={name} {...restProps}>
      {hidden === true ? null : (columnInstance || children)}
    </Form.Item>
  );
}

const FormTable = React.forwardRef<HTMLTableElement, FormTableProps>((props, ref) => {
  const {
    className,
    columns = [],
    minRows = 0,
    maxRows = 50,
    disabled,
    showBtn,
    pagination = false,
    formrender,
    name,
    path,
    field,
    parent,
    value,
    onChange,
    ...rest
  } = props

  const {
    dataSource: tableData,
    addItem,
    deleteItem
  } = useTableData<any>(Array.from({ length: Math.max(value?.length, minRows) }));

  const form = useFormStore();

  const onFieldsChange: ELementProps['onFieldsChange'] = (_, values) => {
    onChange && onChange(values);
  }

  const deleteBtn = (rowIndex: number) => {
    if (disabled) return;
    deleteItem(rowIndex);
    // 更新表单的值(这里采用引用更新)
    const old = form.getFieldValue() || [];
    old.splice(rowIndex, 1);
    onChange && onChange(old);
  }

  const addBtn = () => {
    const list = form.getFieldValue() || [];
    if (list.length >= maxRows) {
      message.info(`最大行数不能超过${maxRows}`)
      return;
    }
    addItem([{ key: defaultGetId('row') }])
  }

  const newColumns = useMemo(() => {
    const result = columns?.map((col) => {
      const { name, label, type, props, ...restCol } = col;
      return {
        ...restCol,
        dataIndex: name,
        title: label,
        onCell: (record: unknown, rowIndex?: number) => ({
          record,
          name: joinFormPath(rowIndex, name), // 拼接路径
          type,
          props,
          formrender: formrender,
          ...restCol,
        }),
      }
    }) as TableProps<any>['columns'] || [];
    if (showBtn) {
      // 添加删除按键
      result.unshift({
        title: '#',
        width: 50,
        render: (text: any, record, index: number) => {
          if (tableData?.length > minRows) {
            return <Icon name="delete" className="delete-icon" onClick={() => deleteBtn(index)} />
          }
        }
      })
    }
    return result;
  }, [columns, showBtn, tableData]);

  return (
    <Form
      form={form}
      className={classNames('form-table', className)}
      tagName="div"
      onFieldsChange={onFieldsChange}
    >
      <Table
        columns={newColumns}
        dataSource={tableData}
        ref={ref}
        rowKey="key"
        scroll={{ y: 400 }}
        components={{ body: { cell: CustomTableCell } }}
        pagination={pagination}
        {...pickAttrs(rest)}
      />
      {showBtn && <Button type="link" className="add-btn" disabled={disabled} onClick={addBtn}>+添加</Button>}
    </Form>
  );
});

export default FormTable;
