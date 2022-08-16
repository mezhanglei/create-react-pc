import { FormFieldProps, SchemaData } from "@/components/react-easy-formrender";
import { exampleElements } from "./group/example";
import { atomElements } from "./base/atom";
import { layoutElements } from "./base/layout";

export { atomElements, layoutElements, exampleElements };

// 列表中的元素类型
export interface ELementProps extends FormFieldProps {
  prefix: string; // 字段前缀
  settings?: SchemaData['properties']; // 属性配置项
}