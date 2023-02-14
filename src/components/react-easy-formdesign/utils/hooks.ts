import { useContext } from "react";
import { joinFormPath } from "../form-render";
import { FormDesignContext, FormEditContext } from "../form-designer/designer-context";
import { isEmpty } from "@/utils/type";

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
