import React, { useEffect } from 'react'
import { ColumnType, TableProps } from 'antd/lib/table'
import Validator from './validator/validator'
import { getCellPath } from './use-edit-table'
import { Table } from 'antd'

export interface EditableHook {
  validator?: Validator
  cellError?: (rowKey: string, dataIndex?: string) => any
}

// 表格的props
export interface EditTableProps<T> extends TableProps<T>, EditableHook {
  columns: EditableColumnsType<T>[]
}

export default (props: EditTableProps<any>) => {
  const { columns, onChange, validator, cellError, ...rest } = props

  const newColumns = columns?.map((col) => {
    return {
      ...col,
      onCell: (record: unknown) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        validator: validator,
        cellError: cellError,
        render: col?.render,
      }),
    }
  })

  return <Table columns={newColumns} rowKey="key" components={{ body: { cell: EditableCell } }} {...rest} />
}

// 可编辑表格的列的类型
export type EditableColumnsType<T> = ColumnType<T> & Omit<EditableCellProps<T>, 'record' | 'dataIndex'>
// 可编辑表格的格的prop
interface EditableCellProps<T> extends ColumnType<T>, EditableHook {
  render?: (value: any, rowData: T) => JSX.Element // 渲染可编辑项, 如果想去掉，则return空就会显示默认的render选项。
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
  cellError,
  render,
  ...restProps
}) => {
  const rowKey = record?.key
  let editChildren = render?.(dataIndex && record?.[dataIndex], record)

  useEffect(() => {
    // 如果没有可编辑项则去掉校验规则
    const path = getCellPath(rowKey, dataIndex)
    if (!path) return
    if (!editChildren && validator) {
      validator?.add?.(path)
    }
  }, [editChildren])
  const displayName = editChildren?.type?.displayName
  const cloneChild =
    displayName === 'Control'
      ? React.cloneElement(editChildren, {
        dataIndex: dataIndex,
        record: record,
        validator: validator,
        error: cellError?.(rowKey, dataIndex),
      })
      : editChildren || children

  return <td {...restProps}>{cloneChild}</td>
}
