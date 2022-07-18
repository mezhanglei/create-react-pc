import { FormFieldProps, SchemaData } from "@/components/react-easy-formrender";
import { exampleElements } from "./group/example";
import { atomElements } from "./base/atom";
import { layoutElements } from "./base/layout";

export const allElements = { ...atomElements, ...layoutElements, ...exampleElements };
export { atomElements, layoutElements, exampleElements };

// 列表中的元素类型
export interface ELementProps extends FormFieldProps {
  settings?: SchemaData['properties'];
}

export interface SideBarElement { [key: string]: ELementProps }