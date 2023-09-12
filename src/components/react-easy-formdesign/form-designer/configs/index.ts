import DefaultFieldSetting from './fieldSetting';
// 基础控件
import Input from './input/render';
import InputSetting from './input/setting';
import RadioGroup from './radioGroup/render';
import RadioGroupSetting from './radioGroup/setting';
import CheckboxGroup from './checkboxGroup/render';
import CheckboxGroupSetting from './checkboxGroup/setting';
import Select from './select/render';
import SelectSetting from './select/setting';
import Switch from './switch/render';
import SwitchSetting from './switch/setting';
import TimePicker from './timePicker/render';
import TimePickerSetting from './timePicker/setting';
import TimePickerRangePicker from './timePickerRangePicker/render';
import TimePickerRangePickerSetting from './timePickerRangePicker/setting';
import DatePicker from './datePicker/render';
import DatePickerSetting from './datePicker/setting';
import DatePickerRangePicker from './datePickerRangePicker/render';
import DatePickerRangePickerSetting from './datePickerRangePicker/setting';
import Slider from './slider/render';
import SliderSetting from './slider/setting';
import Rate from './rate/render';
import RateSetting from './rate/setting';
import ColorPicker from './colorPicker/render';
import ColorPickerSetting from './colorPicker/setting';
import FileUpload from './fileUpload/render';
import FileUploadSetting from './fileUpload/setting';
import ImageUpload from './imageUpload/render';
import ImageUploadSetting from './imageUpload/setting';
import Cascader from './cascader/render';
import CascaderSetting from './cascader/setting';
import RichEditor from "./richEditor/render";
import RichText from "./richText/render";
import RichTextSetting from "./richText/setting";
// 布局组件
// import tableLayout from './layout/table';
import Grid from './grid/render';
import GridRowSetting from './grid/row-setting';
import GridColSetting from './grid/col-setting';
import Divider from './divider/render';
import DividerSetting from './divider/setting';
import Alert from './alert/render';
import AlertSetting from './alert/setting';
// 组合组件
import FormTable from "./formTable/render";
import FormTableSetting from "./formTable/setting";
import { ELementProps } from "../../form-render/components";

export type FormDesignData = { [key: string]: ELementProps } | ELementProps[]
export type ConfigSetting = { [key: string]: FormDesignData }
export type ConfigSettingsType = { [key: string]: ConfigSetting }

// 配置组件
export const ConfigComponents = {
  // 布局组件
  // tableLayout,
  "Grid": Grid,
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
}

// 配置组件的属性区域
export const ConfigSettings = {
  "Input": { ...InputSetting, ...DefaultFieldSetting },
  "Input.TextArea": { ...InputSetting, ...DefaultFieldSetting },
  "InputNumber": { ...InputSetting, ...DefaultFieldSetting },
  "Input.Password": { ...InputSetting, ...DefaultFieldSetting },
  "Radio.Group": { ...RadioGroupSetting, ...DefaultFieldSetting },
  "Checkbox.Group": { ...CheckboxGroupSetting, ...DefaultFieldSetting },
  "Select": { ...SelectSetting, ...DefaultFieldSetting },
  "Switch": { ...SwitchSetting, ...DefaultFieldSetting },
  "TimePicker": { ...TimePickerSetting, ...DefaultFieldSetting },
  "TimePicker.RangePicker": { ...TimePickerRangePickerSetting, ...DefaultFieldSetting },
  "DatePicker": { ...DatePickerSetting, ...DefaultFieldSetting },
  "DatePicker.RangePicker": { ...DatePickerRangePickerSetting, ...DefaultFieldSetting },
  "Slider": { ...SliderSetting, ...DefaultFieldSetting },
  "Rate": { ...RateSetting, ...DefaultFieldSetting },
  "ColorPicker": { ...ColorPickerSetting, ...DefaultFieldSetting },
  "FileUpload": { ...FileUploadSetting, ...DefaultFieldSetting },
  "ImageUpload": { ...ImageUploadSetting, ...DefaultFieldSetting },
  "Cascader": { ...CascaderSetting, ...DefaultFieldSetting },
  "FormTable": { ...FormTableSetting, ...DefaultFieldSetting },
  "Divider": DividerSetting,
  "Alert": AlertSetting,
  "RichText": RichTextSetting,
  "RichEditor": DefaultFieldSetting,
  "Grid.Row": GridRowSetting,
  "GridCol": GridColSetting,
}
