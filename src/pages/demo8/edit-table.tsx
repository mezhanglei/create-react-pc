import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, InputNumber } from 'antd';
import "./edit-table.less";
// import { FormRule, useValidator, Control } from '@/components/react-easy-formcore';
import { ColumnType } from 'antd/lib/table';
import useEditTable from './use-edit-table';
// import Validator from '@/components/react-easy-formcore/validator';

const { Option } = Select;

const Eum = [
  { label: '小米', value: 1 },
  { label: '苹果', value: 2 },
];

export interface DataSource {
  key: string;
  name?: string;
  age?: number;
  tags?: string;
}

export interface EditTableProps {
  value: DataSource[];
  onChange: (data: DataSource[]) => void;
  loading?: boolean;
}

export default ({ value, loading, onChange }: EditTableProps) => {
  // const validator = useValidator();
  const {
    dataSource,
    updateTable,
    deleteRow,
    addRow
  } = useEditTable<DataSource>(value);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      // rules: [{ required: true, message: '不能为空' }],
      render: (text: any, rowData: DataSource, rowIndex: number) => {
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
  ]?.map((col, index) => {
    return {
      ...col,
      onCell: (record: DataSource) => ({
        record,
        dataIndex: col.dataIndex,
        rowIndex: index,
        rules: col?.rules,
        title: col.title,
        // validator: validator,
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
    <Table
      columns={columns}
      rowKey='key'
      // components={{ body: { cell: EditableCell } }}
      dataSource={dataSource}
      loading={loading}
      footer={footer} />
  );
};

// interface EditableCellProps extends ColumnType<DataSource> {
//   // rules: FormRule[];
//   // validator: Validator;
//   title: React.ReactNode;
//   record?: DataSource;
//   rowIndex: number;
//   dataIndex: string;
// }

// // 带校验信息的可编辑控件
// const EditableCell: React.FC<EditableCellProps> = ({
//   title,
//   children,
//   dataIndex,
//   rowIndex,
//   record,
//   // validator,
//   // rules,
//   ...restProps
// }) => {
//   let childNode = children;

//   const getCellPath = (rowIndex: number, colKey: string) => {
//     return rowIndex + colKey;
//   }

//   const [error, setError] = useState<string>();

//   useEffect(() => {
//     const path = getCellPath(rowIndex, dataIndex);
//     if (!validator || !path) return;
//     validator.add(path, rules)
//     return () => {
//       validator.add(path)
//     }
//   }, []);

//   useEffect(() => {
//     const path = getCellPath(rowIndex, dataIndex);
//     if (!path) return;
//     const getError = async () => {
//       const message = await validator.start(path, record?.[dataIndex])
//       setError(message);
//     }
//     getError();
//   }, [rowIndex, dataIndex, record])

//   return (
//     <td {...restProps}>
//       <Control error={error}>
//         {childNode}
//       </Control>
//     </td>
//   );
// };