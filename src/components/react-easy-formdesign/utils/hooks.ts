import { useContext, useState } from "react";
import { joinFormPath } from "../form-render";
import { FormDesignContext, FormEditContext } from "../form-designer/designer-context";
import { isEmpty } from "@/utils/type";
import { setExpandControl } from "@/components/react-easy-formrender/utils/utils";

// 表单设计器的context
export function useFormDesign() {
  const context = useContext(FormDesignContext);
  const selectedName = context?.selected?.name;
  const selectedField = context?.selected?.field;
  const selectedParent = context?.selected?.parent;
  const selectedFormParent = context?.selected?.formparent;
  const selectedPath = isEmpty(selectedName) ? undefined : joinFormPath(selectedParent, selectedName) as string;
  const selectedFormPath = isEmpty(selectedName) ? undefined : joinFormPath(selectedFormParent, selectedField?.ignore ? undefined : selectedName) as string;
  return { ...context, selectedPath, selectedFormPath };
}

// 表单设计器的state
export function useFormEdit() {
  const context = useContext(FormEditContext);
  return context?.setEdit;
}

// 表单设计器的展开的控件
export function useFormExpandControl() {
  const { properties } = useContext(FormDesignContext);
  const result = setExpandControl(properties);
  return result;
}

// 处理列表型的数据
export function useTableData<T = any>(intialValue?: T[], onChange?: (data: T[]) => void) {
  const [dataSource, setDataSource] = useState<T[]>(intialValue || []);

  // 更新目标数据
  const updateItem = (data: any, rowIndex: number, rowKey?: string) => {
    const cloneData = dataSource ? [...dataSource] : [];
    const item = cloneData?.[rowIndex] ?? {};
    if (rowKey) {
      item[rowKey] = data;
    } else {
      cloneData[rowIndex] = data;
    }
    setDataSource(cloneData);
    dataChange(cloneData);
  }

  // 新增一行
  const addItem = (data: T[]) => {
    const newData = dataSource?.concat(data);
    setDataSource(newData);
  }

  // 删除一行
  const deleteItem = (rowIndex: number) => {
    if (!dataSource) return;
    const newData = [...dataSource]
    newData.splice(rowIndex, 1);
    setDataSource(newData);
    dataChange(newData);
  }

  // onChange事件
  const dataChange = (data: T[]) => {
    onChange && onChange(data);
  }

  return {
    updateItem,
    addItem,
    deleteItem,
    dataSource,
    setDataSource
  }
}
