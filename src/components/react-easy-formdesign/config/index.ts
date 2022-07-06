import { FormFieldProps, SchemaData } from "@/components/react-easy-formrender";
import { baseConfig } from "./base";
import { groupConfig } from "./group";

export { baseConfig, groupConfig }

// 列表中的元素类型
export interface SideBarElement extends FormFieldProps {
  setting?: SchemaData;
}

// 侧边栏tab的内容类型
export interface TabContent {
  title: string;
  group: string;
  elements: { [key: string]: SideBarElement };
}