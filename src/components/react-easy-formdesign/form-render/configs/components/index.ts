import { getArrMap } from "@/utils/array";
import { CustomOptions, FormNodeProps } from "../..";
// 基础控件
import Input from './input';
import Radio from './radio';
import Checkbox from './checkbox';
import Select from './select';
import Switch from './switch';
import TimePicker from './timePicker';
import TimePickerRangePicker from './timePickerRangePicker';
import DatePicker from './datePicker';
import DatePickerRangePicker from './datePickerRangePicker';
import Slider from './slider';
import Rate from './rate';
import ColorPicker from './colorPicker';
import FileUpload from './fileUpload';
import ImageUpload from './imageUpload';
import Cascader from './cascader';
import RichEditor from "./richEditor";
import RichText from "./richText";
// 布局组件
// import tableLayout from './layout/table';
import grid from './grid';
import divider from './divider';
import Alert from './alert';
// 组合组件
import formTable from "./formTable";
import { getExpanded } from "@/components/react-easy-formdesign/utils/utils";

// 列表中的元素类型
export interface ELementProps extends FormNodeProps, CustomOptions {
  id?: string; // 当前节点的id
  additional?: string | string[]; // 当前节点内的组件id
  icon?: string; // 组件列表中的icon
  componentLabel?: string; // 组件列表中的显示名字
  includes?: string[]; // 限制可以添加的子元素id
  properties?: { [name: string]: ELementProps } | ELementProps[]
}

export type FormDesignData = { [key: string]: ELementProps } | ELementProps[]

export type OriginComponents = Array<{ title: string, elements: Array<ELementProps> }>;

// 在使用前转换components
export const convertComponents = (components: OriginComponents) => {
  const expanded = getExpanded(components);
  const elementsMap = getArrMap(expanded, 'id');
  return {
    origin: components, // 原始渲染数据
    expanded: expanded, // 展开的组件列表
    map: elementsMap, // map结构
  }
}

const components = [
  {
    title: '布局组件',
    elements: [
      // tableLayout,
      grid,
      divider,
      Alert,
    ]
  },
  {
    title: '控件组合',
    elements: [
      formTable
    ]
  },
  {
    title: '基础控件',
    elements: [
      Input,
      Radio,
      Checkbox,
      Select,
      Switch,
      TimePicker,
      TimePickerRangePicker,
      DatePicker,
      DatePickerRangePicker,
      Slider,
      Rate,
      ColorPicker,
      Cascader,
      FileUpload,
      ImageUpload,
      RichEditor,
      RichText,
    ]
  },
  {
    title: '业务组件',
    elements: [
    ]
  }
];

export default components;