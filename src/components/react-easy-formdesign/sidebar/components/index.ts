import { FormFieldProps } from "../../form-render";

import atomElement from './base/atom';
import layoutElement from './base/layout';
import exampleElement from './template/example';

export const AllElements = Object.fromEntries([atomElement, layoutElement, exampleElement])

export const TabsData = [{
  key: 'base',
  tab: '基础组件',
  data: [
    { title: '基础控件', elementsKey: atomElement[0], elements: atomElement[1] },
    { title: '布局组件', elementsKey: layoutElement[0], elements: layoutElement[1] }
  ]
}, {
  key: 'example',
  tab: '表单模板',
  data: [
    { title: '示例', elementsKey: exampleElement[0], elements: exampleElement[1] },
  ]
}]

// 列表中的元素类型
export interface ELementProps extends FormFieldProps {
  prefix?: string;
  settings?: FormFieldProps['properties']; // 属性配置项
  properties?: { [name: string]: ELementProps } | ELementProps[]
}
