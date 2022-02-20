import { Table } from 'antd';
import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import { getGUID } from '@/utils/character';
import { EditTableRow, EditTableCol } from './table-components';
import { EditTableRef, EditTableProps, RowData, ColumnProps } from './types';

/**
 * 可编辑表格组件：支持表格嵌入外来输入控件，只需要将props.save方法暴露给输入控件使用.输入控件需要遵循antd的form控件标准（onChange输出，value引入）
 * 使用方式：继承antd的table的一切方法，同时支持了拓展参数和方法
 */

const EditTable = React.forwardRef<EditTableRef, EditTableProps>((props, ref) => {
  const { onChange, onSave, onDelete, value, columns, className, ...restProps } = props;

  const [dataSource, setDataSource] = useState<RowData[]>([]);

  // ref转发实例方法
  React.useImperativeHandle(ref, () => ({
    updateCell: updateCell,
    deleteTableRow: handleDelete,
    addTableRow: addTableRow
  }));

  useEffect(() => {
    setDataSource(value || [{}]);
  }, [value]);

  // 触发保存事件
  const handleSave = (rowData: RowData, col: ColumnProps) => {
    updateCell(rowData, col);
    onSave && onSave(dataSource, rowData, col);
  };

  // 点击添加
  const addTableRow = () => {
    const newData = {
      key: getGUID()
    };
    const newDataSource = [...dataSource, newData];
    setDataSource(newDataSource);
  };

  // 删除行
  const handleDelete = (rowData: RowData) => {
    // 本地删除
    const newDataSource = [...dataSource]?.filter((item) => item.key !== rowData.key);
    setDataSource(newDataSource);
    onChange && onChange(newDataSource, rowData);
    onDelete && onDelete(newDataSource, rowData);
  };

  // 修改表格
  const updateCell = (rowData: RowData, col?: ColumnProps): unknown => {
    const newDataSource = [...dataSource];
    const index = newDataSource.findIndex((item) => rowData.key === item.key);
    const item = newDataSource[index];
    newDataSource.splice(index, 1, {
      ...item,
      ...rowData
    });
    setDataSource(newDataSource);
    onChange && onChange(newDataSource, rowData, col);
    return newDataSource;
  };

  // 覆盖默认的table元素
  const components = {
    body: {
      row: EditTableRow,
      cell: EditTableCol
    }
  };

  // 包装渲染列数组
  const editColumns = columns?.map((col) => {
    // 如果不渲染可编辑单元格则返回正常单元格
    if (!col.renderEditCell) {
      return col;
    }
    return {
      ...col,
      // 传递给cell组件的参数
      onCell: (rowData: RowData) => ({
        rowData,
        handleSave: (row: RowData) => handleSave(row, col),
        ...col
      })
    };
  });

  return (
    <Table
      tableLayout="fixed"
      className={classnames('small-cell fixed-table', className)}
      rowKey="key"
      components={components}
      columns={editColumns}
      dataSource={dataSource || []}
      {...restProps}
    />
  );
});

export default EditTable;

export const EditableContext = React.createContext<any>(null);
