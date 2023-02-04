import { useContext } from "react";
import { joinPath } from "../form-render";
import { FormDesignContext, FormEditContext } from "../form-designer/designer-context";
import { isEmpty } from "@/utils/type";

// 表单设计器的context
export function useFormDesign() {
  const context = useContext(FormDesignContext);
  const selectedName = context?.selected?.name;
  const selectedParent = context?.selected?.parent;
  const selectedPath = isEmpty(selectedName) ? undefined : joinPath(selectedParent, selectedName) as string;
  return { ...context, selectedPath };
}

// 表单设计器的state
export function useFormEdit() {
  const context = useContext(FormEditContext);
  return context?.setEdit;
}
