import { FormFieldProps } from "../../../form-render";
import atomElement from './atom';
import layoutElement from './layout';
import exampleElement from './example';

// 列表中的元素类型
export interface ELementProps extends FormFieldProps {
  source?: string;
  settings?: FormFieldProps['properties']; // 属性配置项
  properties?: { [name: string]: ELementProps } | ELementProps[]
}

export type ElementsType = { [key: string]: ELementProps }

export type FormDesignData = { [key: string]: ELementProps } | ELementProps[]

// 基础元素
export const baseElements = [atomElement, layoutElement]
// 模板元素
export const exampleElements = [exampleElement]
// 所有元素
export const ConfigElements: ElementsType = Object.fromEntries([...baseElements, ...baseElements]);

export const TabsData = [{
  key: 'base',
  tab: '基础组件',
  data: baseElements?.map(([title, elements]) => {
    return {
      title: title,
      elementType: title,
      elements: elements,
    }
  })
}, {
  key: 'example',
  tab: '表单模板',
  data: exampleElements?.map(([title, elements]) => {
    return {
      title: title,
      elementType: title,
      elements: elements,
    }
  })
}]
