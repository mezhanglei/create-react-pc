import { CustomOptions, FormNodeProps } from "../..";
// 基础控件
import Input from './input';
import RadioGroup from './radioGroup';
import CheckboxGroup from './checkboxGroup';
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
import GridRow from './gridRow';
import Divider from './divider';
import Alert from './alert';
// 组合组件
import FormTable from "./formTable";

// 列表中的元素类型
export interface ELementProps extends FormNodeProps, CustomOptions {
  includes?: string[]; // 子元素限制可以添加的组件类型
  configLabel?: string; // 配置组件的名
  configIcon?: string; // 配置组件的图标
  properties?: { [name: string]: ELementProps } | ELementProps[] // 子元素渲染树
}

export type FormDesignData = { [key: string]: ELementProps } | ELementProps[]

const components = {
  // 布局组件
  // tableLayout,
  "Grid.Row": GridRow,
  "Divider": Divider,
  "Alert": Alert,
  // 控件组合
  "FormTable": FormTable,
  // 基础控件
  "Input": Input,
  "Radio.Group": RadioGroup,
  "Checkbox.Group": CheckboxGroup,
  "Select": Select,
  "Switch": Switch,
  "TimePicker": TimePicker,
  "TimePicker.RangePicker": TimePickerRangePicker,
  "DatePicker": DatePicker,
  "DatePicker.RangePicker": DatePickerRangePicker,
  "Slider": Slider,
  "Rate": Rate,
  "ColorPicker": ColorPicker,
  "Cascader": Cascader,
  "FileUpload": FileUpload,
  "ImageUpload": ImageUpload,
  "RichEditor": RichEditor,
  "RichText": RichText,
  // 业务组件
}

export default components;