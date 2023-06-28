import React, { useEffect, useMemo } from "react";
import { Button, message, Table, TableProps } from "antd";
import pickAttrs from "@/utils/pickAttrs";
import { TableCell } from "./components";
import { Form, joinFormPath, useFormStore } from "../../..";
import classNames from 'classnames';
import './formTable.less';
import { ELementProps } from "@/components/react-easy-formdesign/form-designer/components/configs";
import { useTableData } from "@/components/react-easy-formdesign/utils/hooks";
import { defaultGetId } from "@/components/react-easy-formdesign/utils/utils";
import Icon from '@/components/svg-icon';
import { FormTableProps } from "..";

const CustomTableCell = (props: any) => {
  const { name, formrender, type, disabled, props: typeProps, hidden, children, ...restProps } = props;
  const columnInstance = formrender && formrender.componentInstance({ type, props: Object.assign({ disabled }, typeProps) });
  return (
    <TableCell key={name}>
      <Form.Item {...restProps} label="" name={name}>
        {hidden === true ? null : (columnInstance || children)}
      </Form.Item>
    </TableCell>
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

  const items = Array.from({ length: Math.max(value?.length || 0, minRows || 0) });
  const defaultValue = useMemo(() => items.map(() => ({ key: defaultGetId('row') })), [items]);
  const {
    dataSource: tableData,
    setDataSource,
    addItem,
    deleteItem
  } = useTableData<any>(defaultValue);

  useEffect(() => {
    setDataSource(defaultValue);
  }, [minRows]);

  const form = rest?.form || useFormStore();

  const onValuesChange: ELementProps['onFieldsChange'] = (_, values) => {
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
    if (tableData?.length >= maxRows) {
      message.info(`最大行数不能超过${maxRows}`)
      return;
    }
    addItem([{ key: defaultGetId('row') }])
  }

  const newColumns = useMemo(() => {
    const result = columns?.map((col) => {
      const { dataIndex, title, type, props, ...restCol } = col;
      return {
        ...restCol,
        dataIndex: dataIndex,
        title: title,
        onCell: (record: unknown, rowIndex?: number) => ({
          record,
          name: joinFormPath(rowIndex, dataIndex), // 拼接路径
          type,
          props,
          disabled,
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
  }, [columns, showBtn, tableData, disabled]);

  return (
    <Form
      form={form}
      className={classNames('form-table', className)}
      tagName="div"
      onValuesChange={onValuesChange}
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
