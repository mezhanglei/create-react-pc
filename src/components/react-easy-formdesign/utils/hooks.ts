import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { deepSet } from "../form-render";
import { FormDesignContext, FormEditContext, SelectedType } from "../form-designer/designer-context";
import { setExpandComponents } from "@/components/react-easy-formrender/utils/utils";
import { getFromSelected } from "./utils";
import EventBus from "@/utils/event-bus";

export function useEventBus() {
  return useMemo(() => new EventBus(), [])
}

// 获取当前hover的内容
export function useHoverSelected() {
  const context = useContext(FormDesignContext);
  const [hoverSelected, setHoverSelected] = useState<SelectedType>();

  useEffect(() => {
    context.eventBus.on('hover', (val: SelectedType) => {
      setHoverSelected(val);
    });
  }, []);

  return hoverSelected;
}

// 表单设计器的context
export function useFormDesign() {
  const context = useContext(FormDesignContext);
  const fromSelected = getFromSelected(context?.selected);
  return { ...context, ...fromSelected };
}

// 表单设计器的state
export function useFormEdit() {
  const context = useContext(FormEditContext);
  return context;
}

// 表单设计器的展开的控件
export function useExpandComponents() {
  const { properties } = useContext(FormDesignContext);
  const result = setExpandComponents(properties);
  return result;
}

// 处理列表型的数据
export function useTableData<T = any>(intialValue?: T[], onChange?: (data: T[]) => void) {
  const [dataSource, setData] = useState<T[]>(intialValue || []);
  const dataSourceRef = useRef<T[]>(intialValue || []);

  const setDataSource = (data: T[]) => {
    if (data instanceof Array) {
      setData(data);
      dataSourceRef.current = data;
    }
  }

  // onChange事件
  const dataChange = (data: T[]) => {
    onChange && onChange(data);
  }

  // 更新目标数据
  const updateItem = (data: any, rowIndex: number, path?: string) => {
    const oldData = dataSourceRef.current;
    const cloneData = oldData ? [...oldData] : [];
    let item = cloneData?.[rowIndex] ?? {};
    if (path) {
      cloneData[rowIndex] = deepSet(item, path, data)
    } else {
      cloneData[rowIndex] = data;
    }
    setDataSource(cloneData);
    dataChange(cloneData);
  }

  // 新增一行
  const addItem = (data: T[]) => {
    const oldData = dataSourceRef.current;
    const newData = oldData?.concat(data);
    setDataSource(newData);
  }

  // 删除一行
  const deleteItem = (rowIndex: number) => {
    const oldData = dataSourceRef.current;
    if (!oldData) return;
    const newData = [...oldData];
    newData.splice(rowIndex, 1);
    setDataSource(newData);
    dataChange(newData);
  }

  return {
    updateItem,
    addItem,
    deleteItem,
    dataSource,
    setDataSource
  }
}
