import { useContext } from "react";
import { getCurrentPath } from "../../form-render";
import { FormDesignContext } from "../designer-context";
import { setSelectedValues, updateSelectedValues } from "./utils";

// 获取表单的选中项
export function useSelected() {
  const { selected } = useContext(FormDesignContext);
  const selectedName = selected?.name;
  const selectedParent = selected?.parent;
  const selectedPath = getCurrentPath(selectedName, selectedParent) as string;
  return { selected, selectedPath };
}

// 更新表单的属性配置
export function useSettingsForm() {

  const { designer, designerForm } = useContext(FormDesignContext);

  const updateValues = (selectedPath: string, formValues: any) => {
    updateSelectedValues(designer, designerForm, selectedPath, formValues);
  }

  const setValues = (selectedPath: string, formValues: any) => {
    setSelectedValues(designer, designerForm, selectedPath, formValues)
  }

  return {
    updateValues,
    setValues
  }
}