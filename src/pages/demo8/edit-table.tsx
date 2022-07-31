import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, InputNumber } from 'antd';
import { deepClone } from '@/utils/object';
import { DataSource } from '.';
import "./edit-table.less";
import ItemWrapper from './item-wrapper';
import { useValidator } from '@/components/react-easy-formcore';
import { ColumnType } from 'antd/lib/table';
import useEditTable from '@/hooks/use-edit-table';

const { Option } = Select;

const Eum = [
  { label: '小米', value: 1 },
  { label: '苹果', value: 2 },
];

export interface EditTableProps {
  value: DataSource[];
  onChange: (data: DataSource[]) => void;
  loading?: boolean;
}

interface EditableCellProps extends ColumnType<DataSource> {
  title: React.ReactNode;
  editable?: boolean;
  record?: DataSource;
}

export default ({ value, loading, onChange }: EditTableProps) => {
  const validator = useValidator();
  const {
    dataSource,
    updateTable,
    deleteRow,
    addRow
  } = useEditTable<DataSource>(value);

  const getCellPath = (rowIndex: number, colKey: string) => {
    return rowIndex + colKey;
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      render: (text: any, rowData: DataSource, rowIndex: number) => {
        // const path = getCellPath(rowIndex, rowData?.key);
        return (
          <Input
            style={{ width: '100%' }}
            value={text}
            onChange={(e) => {
              const newData = updateTable(e?.target?.value, 'name', rowIndex)
              onChange && onChange(newData)
            }}
          />
        );
      },
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      width: '20%',
      render: (text: any, rowData: DataSource, rowIndex: number) => {
        return (
          <Select
            style={{ width: '100%' }}
            value={text}
            onChange={(e) => {
              const newData = updateTable(e?.target?.value, 'age', rowIndex)
              onChange && onChange(newData)
            }}
          >
            {Eum.map(item => {
              return (
                <Option value={item.value} key={item.label}>
                  {item.label}
                </Option>
              );
            })}
          </Select>
        );
      },
    },
    {
      title: 'Tags',
      key: 'tags',
      dataIndex: 'tags',
      width: '10%',
      render: (text: any, rowData: DataSource, rowIndex: number) => {
        return (
          <InputNumber
            style={{ width: '100%' }}
            value={text}
            onChange={(e) => {
              const newData = updateTable(e?.target?.value, 'tags', rowIndex)
              onChange && onChange(newData)
            }}
          />
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: '20%',
      render: (text: unknown, rowData: DataSource, rowIndex: number) => {
        return (
          <Button type="link" style={{ marginBottom: '10px' }}
            onClick={() => {
              const newData = deleteRow({ rowData, rowIndex })
              onChange && onChange(newData)
            }}>
            删除
          </Button>
        );
      },
    },
  ]?.map((col) => {
    return {
      ...col,
      onCell: (record: DataSource) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title
      })
    };
  })

  const footer = () => {
    return (
      <a
        onClick={(e) => {
          e.preventDefault()
          const newData = addRow();
          onChange && onChange(newData)
        }}>添加</a>
    );
  }

  return (
    <Table columns={columns} rowKey='key' components={{ body: { cell: EditableCell } }} dataSource={dataSource} loading={loading} footer={footer} />
  );
};

// 可编辑控件
const EditableCell: React.FC<EditableCellProps> = ({
  title,
  children,
  dataIndex,
  record,
  ...restProps
}) => {
console.log(record, 444)
  let childNode = children;

  return (
    <td {...restProps}>
      <ItemWrapper error="111">
        {childNode}
      </ItemWrapper>
    </td>
  );
};