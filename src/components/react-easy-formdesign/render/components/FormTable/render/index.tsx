import React, { useEffect, useMemo } from "react";
import { Button, message, Table, TableProps } from "antd";
import pickAttrs from "@/utils/pickAttrs";
import { TableCell } from "./components";
import { Form, joinFormPath } from "../../..";
import './index.less';
import { useTableData } from "@/components/react-easy-formdesign/render/utils/hooks";
import { defaultGetId } from "@/components/react-easy-formdesign/render/utils/utils";
import Icon from '@/components/SvgIcon';
import { FormTableProps } from "..";

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
    form,
    formrender,
    name,
    path,
    field,
    parent,
    ...rest
  } = props

  const items = Array.from({ length: Math.max(minRows || 0) });
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

  const deleteBtn = (rowIndex: number) => {
    if (disabled) return;
    deleteItem(rowIndex);
    const old = form && form.getFieldValue(name) || [];
    old.splice(rowIndex, 1);
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
        onCell: (record: unknown, rowIndex?: number) => {
          const formControl = formrender && formrender.componentInstance({ type, props: Object.assign({ disabled }, props) });
          return {
            record,
            name: joinFormPath(name, rowIndex, dataIndex), // 拼接路径
            formControl: formControl,
            ...restCol,
          }
        },
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
    <>
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
    </>
  );
});

export default FormTable;
