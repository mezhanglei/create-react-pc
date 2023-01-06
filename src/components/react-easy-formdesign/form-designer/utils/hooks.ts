import { useContext } from "react";
import { getCurrentPath } from "../../form-render";
import { FormDesignContext, FormEditContext } from "../designer-context";

// 表单设计器的context
export function useFormDesign() {
  const context = useContext(FormDesignContext);
  const selectedName = context?.selected?.name;
  const selectedParent = context?.selected?.parent;
  const selectedPath = getCurrentPath(selectedName, selectedParent) as string;
  return { ...context, selectedPath };
}

// 表单设计器的state
export function useFormEdit() {
  const context = useContext(FormEditContext);
  return context?.setEdit;
}
