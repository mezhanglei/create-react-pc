import React, { useMemo } from 'react'
import { ColumnType, TableProps } from 'antd/lib/table'
import Validator from '../react-easy-formcore/validator'
import { Table } from 'antd'

export interface EditableHook {
  validator?: Validator
}

// 表格的props
export interface EditTableProps<T> extends TableProps<T>, EditableHook {
  columns: EditableColumnsType<T>[]
}

export const TableControlContext = React.createContext<any>({})

export default (props: EditTableProps<any>) => {
  const { columns, onChange, validator, ...rest } = props

  const newColumns = useMemo(() => columns?.map((col) => {
    return {
      ...col,
      onCell: (record: unknown) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        validator: validator,
      }),
    }
  }), [columns])

  return <Table columns={newColumns} rowKey="key" components={{ body: { cell: EditableCell } }} {...rest} />
}

// 可编辑表格的列的类型
export type EditableColumnsType<T> = ColumnType<T> & Omit<EditableCellProps<T>, 'record' | 'dataIndex'>
// 可编辑表格的格的prop
interface EditableCellProps<T> extends ColumnType<T>, EditableHook {
  record: T
  title: any
  dataIndex?: string
}

// 带校验信息的可编辑控件
const EditableCell: React.FC<EditableCellProps<any>> = ({
  title,
  children,
  dataIndex,
  record,
  validator,
  ...restProps
}) => {

  const result = (
    <TableControlContext.Provider value={{
      dataIndex: dataIndex,
      key: record?.key,
      validator: validator,
    }}>
      {children}
    </TableControlContext.Provider>
  )

  return <td {...restProps}>{result}</td>
}
