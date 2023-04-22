import { getArrMap } from "@/utils/array";
import { CustomOptions, FormFieldProps } from "../../../form-render";
// 基础控件
import Input from './base/input';
import Radio from './base/radio';
import Checkbox from './base/checkbox';
import Select from './base/select';
import Switch from './base/switch';
import TimePicker from './base/timePicker';
import DatePicker from './base/datePicker';
import Slider from './base/slider';
import Rate from './base/rate';
import ColorPicker from './base/colorPicker';
import FileUpload from './base/fileUpload';
import ImageUpload from './base/imageUpload';
import Cascader from './base/cascader';
import Alert from './base/alert';
import RichEditor from "./base/richEditor";
import RichText from "./base/richText";
// 布局组件
import tableLayout from './layout/table';
import grid from './layout/grid';
// 容器字段
import formTable from "./container/table";

// 列表中的元素类型
export interface ELementProps extends FormFieldProps, CustomOptions {
  id?: string; // 组件类型id，用于匹配组件
  icon?: string; // 组件列表中的icon
  componentLabel?: string; // 组件列表中的显示名字
  disabledEdit?: boolean; // 禁止编辑
  includes?: string[]; // 限制可以添加的子元素id
  properties?: { [name: string]: ELementProps } | ELementProps[]
}

export type ElementsType = { [key: string]: ELementProps }

export type FormDesignData = { [key: string]: ELementProps } | ELementProps[]

export const TabsData = [{
  key: 'base',
  tab: '基础组件',
  children: [
    {
      title: '布局组件',
      elementType: '布局组件',
      elements: [
        tableLayout,
        grid,
      ]
    },
    {
      title: '容器组件',
      elementType: '容器组件',
      elements: [
        formTable
      ]
    },
    {
      title: '基础控件',
      elementType: '基础控件',
      elements: [
        Input,
        Radio,
        Checkbox,
        Select,
        Switch,
        TimePicker,
        DatePicker,
        Slider,
        Rate,
        ColorPicker,
        Cascader,
        FileUpload,
        ImageUpload,
        Alert,
        RichEditor,
        RichText,
      ]
    },
    {
      title: '业务组件',
      elementType: '业务组件',
      elements: [
      ]
    }
  ]
}, {
  key: 'example',
  tab: '表单模板',
  children: [
    {
      title: '',
      elementType: '',
      elements: []
    }
  ]
}]

// 所有元素的展平列表
export const ConfigElements = TabsData.reduce((pre: ELementProps[], cur) => {
  let temp: ELementProps[] = [];
  const children = cur?.children;
  for (let i = 0; i < children?.length; i++) {
    const elements = children[i]?.elements;
    temp = temp.concat(elements);
  }
  return pre.concat(temp)
}, []);

// 所有元素列表转成的map结构
export const ConfigElementsMap: ElementsType = getArrMap(ConfigElements, 'id');
// 可拖拽的区域类型
export enum DndType  {
  Components ='components'
}