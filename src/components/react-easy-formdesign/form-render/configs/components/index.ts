import { getArrMap } from "@/utils/array";
import { CustomOptions, FormNodeProps } from "../..";
// 基础控件
import Input from './base/input';
import Radio from './base/radio';
import Checkbox from './base/checkbox';
import Select from './base/select';
import Switch from './base/switch';
import TimePicker from './base/timePicker';
import TimePickerRangePicker from './base/timePickerRangePicker';
import DatePicker from './base/datePicker';
import DatePickerRangePicker from './base/datePickerRangePicker';
import Slider from './base/slider';
import Rate from './base/rate';
import ColorPicker from './base/colorPicker';
import FileUpload from './base/fileUpload';
import ImageUpload from './base/imageUpload';
import Cascader from './base/cascader';
import RichEditor from "./base/richEditor";
import RichText from "./base/richText";
// 布局组件
// import tableLayout from './layout/table';
import grid from './layout/grid';
import divider from './layout/divider';
import Alert from './layout/alert';
// 组合组件
import formTable from "./combo/table";
import { getExpanded } from "@/components/react-easy-formdesign/utils/utils";

// 列表中的元素类型
export interface ELementProps extends FormNodeProps, CustomOptions {
  id?: string; // 组件类型id，用于匹配组件的配置
  subId?: string; // 子组件的id， 用于匹配子组件的配置
  icon?: string; // 组件列表中的icon
  componentLabel?: string; // 组件列表中的显示名字
  includes?: string[]; // 限制可以添加的子元素id
  properties?: { [name: string]: ELementProps } | ELementProps[]
}

export type FormDesignData = { [key: string]: ELementProps } | ELementProps[]
// 可拖拽的区域类型
export enum DndType {
  Components = 'components'
}

// 转换components
const convertComponents = (components: Array<{ title: string, elements: Array<ELementProps> }>) => {
  const expanded = getExpanded(components);
  const elementsMap = getArrMap(expanded, 'id');
  return {
    origin: components, // 原始渲染数据
    expanded: expanded, // 展开的组件列表
    map: elementsMap, // map结构
  }
}

export const components = [
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

const configs = convertComponents(components);
export default configs;