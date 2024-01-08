import React, { useEffect, useImperativeHandle, useMemo } from "react";
import { Button, message, Table, TableProps } from "antd";
import pickAttrs from "@/utils/pickAttrs";
import { TableCell } from "./components";
import classNames from 'classnames';
import './index.less';
import SvgIcon from '@/components/SvgIcon';
import { Form, FormProps, SimpleForm, joinFormPath, useSimpleForm } from "@simpleform/render";
import { useTableData } from "./utils";
import { FormTableProps } from "./types";

const CustomTableCell = (props: any) => {
  const { name, hidden, formControl, children, ...restProps } = props;
  return (
    <TableCell key={name} {...restProps}>
      {
        formControl ?
          <Form.Item {...restProps} label="" name={name}>
            {hidden === true ? null : formControl}
          </Form.Item>
          : children
      }
    </TableCell>
  );
};

// 可编辑表格(ref方案，通过ref来获取值)
const FormTable = React.forwardRef<SimpleForm, FormTableProps>((props, ref) => {
  const {
    className,
    columns = [],
    minRows = 0,
    maxRows = 50,
    disabled,
    showBtn = true,
    pagination = false,
    ...rest
  } = props;

  const defaultValue = Array.from({ length: minRows || 0 });
  const {
    dataSource: tableData,
    setDataSource,
    addItem,
    deleteItem
  } = useTableData<any>(defaultValue);

  useEffect(() => {
    setDataSource(defaultValue);
  }, [minRows]);

  const tableForm = useSimpleForm();

  useImperativeHandle(ref, () => tableForm);

  const onValuesChange: FormProps['onValuesChange'] = (_, values) => {
    setDataSource(values);
  };

  const deleteBtn = (rowIndex: number) => {
    if (disabled) return;
    deleteItem(rowIndex);
    // 更新表单的值(这里采用引用更新)
    const old = tableForm.getFieldValue() || [];
    old.splice(rowIndex, 1);
    tableForm.setFieldsValue([...old]);
  };

  const addBtn = () => {
    if (tableData?.length >= maxRows) {
      message.info(`最大行数不能超过${maxRows}`);
      return;
    }
    addItem([{}]);
    const newDataSource = tableData.concat({});
    tableForm.setFieldsValue(newDataSource);
  };

  const newColumns = useMemo(() => {
    const result = columns?.map((col) => {
      const { dataIndex, title, renderFormItem, ...restCol } = col;
      return {
        ...restCol,
        dataIndex: dataIndex,
        title: title,
        onCell: (record: any, rowIndex?: number) => {
          const formControl = renderFormItem && typeof dataIndex == 'string' && renderFormItem(record?.[dataIndex], record);
          return {
            record,
            name: joinFormPath(rowIndex, dataIndex), // 拼接路径
            formControl: formControl,
            ...restCol,
          };
        },
      };
    }) as TableProps<any>['columns'] || [];
    if (showBtn) {
      // 添加删除按键
      result.unshift({
        title: '#',
        width: 50,
        render: (text: any, record, index: number) => {
          if (tableData?.length > minRows) {
            return <SvgIcon name="delete" className="delete-icon" onClick={() => deleteBtn(index)} />;
          }
        }
      });
    }
    return result;
  }, [columns, showBtn, tableData, disabled]);

  return (
    <Form
      form={tableForm}
      className={classNames('form-table', className)}
      tagName="div"
      onValuesChange={onValuesChange}
    >
      <Table
        columns={newColumns}
        dataSource={tableData}
        rowKey={(_, index) => `${index}`}
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
