import React, { CSSProperties, useEffect, useMemo } from "react";
import { Button, Table, TableProps } from "antd";
import pickAttrs from "@/utils/pickAttrs";
import { TableCell } from "./components";
import { Form, GeneratePrams, joinFormPath, useFormStore } from "../../..";
import classNames from 'classnames';
import './formTable.less';
import { ELementProps } from "@/components/react-easy-formdesign/form-designer/components/configs";
import { useTableData } from "@/components/react-easy-formdesign/utils/hooks";
import { defaultGetId } from "@/components/react-easy-formdesign/utils/utils";

export interface CustomColumnType {
  key: string;
  name: string;
  label: string;
  type?: string;
  props?: any;
}

export interface FormTableProps extends TableProps<any>, GeneratePrams<ELementProps> {
  value?: any;
  onChange?: (val: any) => void;
  columns: CustomColumnType[];
  className?: string;
  style?: CSSProperties;
}

const CustomTableCell = (props: any) => {
  const { name, formrender, type, props: typeProps, children, ...restProps } = props;
  const columnInstance = formrender && formrender.componentInstance({ type, props: typeProps });
  return (
    <Form.Item component={TableCell} name={name} key={name} {...restProps}>
      {columnInstance || children}
    </Form.Item>
  );
}

const FormTable = React.forwardRef<HTMLTableElement, FormTableProps>((props, ref) => {
  const {
    className,
    columns = [],
    dataSource = [],
    formrender,
    name,
    path,
    field,
    parent,
    value,
    pagination = false,
    onChange,
    ...rest
  } = props

  const {
    dataSource: tableData,
    setDataSource,
    addItem,
    deleteItem
  } = useTableData<any>(dataSource, onChange);

  const newColumns = useMemo(() => columns?.map((col) => {
    const { name, label, type, props: typeProps, ...restCol } = col;
    return {
      ...restCol,
      dataIndex: name,
      title: label,
      onCell: (record: unknown, rowIndex?: number) => ({
        record,
        name: joinFormPath(rowIndex, name), // 拼接路径
        title: label,
        formrender: formrender,
        type: type,
        props: typeProps,
      }),
    }
  }), [columns]);

  const form = useFormStore();

  const onFieldsChange: ELementProps['onFieldsChange'] = (_, values) => {
    onChange && onChange(values);
  }

  const addBtn = () => {
    addItem([{ key: defaultGetId('row') }])
  }

  return (
    <Form form={form} tagName="div" initialValues={value} onFieldsChange={onFieldsChange}>
      <Table
        className={classNames('form-table', className)}
        columns={newColumns}
        dataSource={tableData}
        ref={ref}
        rowKey="key"
        tableLayout="fixed"
        components={{ body: { cell: CustomTableCell } }}
        {...pickAttrs(rest)}
        pagination={pagination}
      />
      <Button type="link" onClick={addBtn}>+添加</Button>
    </Form>
  );
});

export default FormTable;
