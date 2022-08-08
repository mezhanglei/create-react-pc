import { deepClone } from "@/utils/object";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";

export const getNanoid = () => {
  // 可换成自己所用的随机id生成
  return nanoid(6);
};

// 可编辑表格的数据处理hook
export default function useEditTable<T extends { key?: string }>(value: T[]) {
  const [dataSource, setDataSource] = useState<T[]>([]);

  useEffect(() => {
    setDataSource(value || []);
  }, [value]);

  const updateTable = (value: any, dataIndex: string, rowIndex: number) => {
    const newData = deepClone(dataSource);
    newData[rowIndex][dataIndex] = value;
    setDataSource(newData);
    return newData;
  };

  const deleteRow = (row: { rowData: T, rowIndex: number }) => {
    const { rowData, rowIndex } = row;
    const index = rowIndex ?? dataSource?.findIndex((item) => item?.key === rowData?.key);
    const newData = deepClone(dataSource);
    newData.splice(index, 1);
    setDataSource(newData);
    return newData;
  };

  const addRow = (rowData?: T) => {
    const newData = deepClone(dataSource);
    const item = { key: getNanoid(), ...rowData };
    newData.push(item);
    setDataSource(newData);
    return newData;
  };

  return {
    dataSource,
    updateTable,
    deleteRow,
    addRow
  }
}