import DefaultFieldSettings from "./field";
// 基础控件
import InputSettings from "./input";
import RadioGroupSettings from "./radioGroup";
import CheckboxGroupSettings from './checkboxGroup';
import SelectSettings from './select';
import SwitchSettings from './switch';
import TimePickerSettings from './timePicker';
import TimePickerRangePickerSettings from './timePickerRangePicker';
import DatePickerSettings from './datePicker';
import DatePickerRangePickerSettings from './datePickerRangePicker';
import SliderSettings from './slider';
import RateSettings from './rate';
import ColorPickerSettings from './colorPicker';
import FileUploadSettings from './fileUpload';
import ImageUploadSettings from './imageUpload';
import CascaderSettings from './cascader';
import RichTextSettings from './richText';
// 布局组件
import GridRowSettings from './gridRow';
import GridColSettings from './gridCol';
import DividerSettings from './divider';
import AlertSettings from './alert';
// 组合组件
import FormTableSettings from './formTable';
import { FormDesignData } from "../components";
// 业务组件

export type SettingsItem = { [key: string]: FormDesignData }
export type SettingsMapType = { [key: string]: SettingsItem }

// 配置
const configSettings = {
  "Input": { ...InputSettings, ...DefaultFieldSettings },
  "Radio.Group": { ...RadioGroupSettings, ...DefaultFieldSettings },
  "Checkbox.Group": { ...CheckboxGroupSettings, ...DefaultFieldSettings },
  "Select": { ...SelectSettings, ...DefaultFieldSettings },
  "Switch": { ...SwitchSettings, ...DefaultFieldSettings },
  "TimePicker": { ...TimePickerSettings, ...DefaultFieldSettings },
  "TimePicker.RangePicker": { ...TimePickerRangePickerSettings, ...DefaultFieldSettings },
  "DatePicker": { ...DatePickerSettings, ...DefaultFieldSettings },
  "DatePicker.RangePicker": { ...DatePickerRangePickerSettings, ...DefaultFieldSettings },
  "Slider": { ...SliderSettings, ...DefaultFieldSettings },
  "Rate": { ...RateSettings, ...DefaultFieldSettings },
  "ColorPicker": { ...ColorPickerSettings, ...DefaultFieldSettings },
  "FileUpload": { ...FileUploadSettings, ...DefaultFieldSettings },
  "ImageUpload": { ...ImageUploadSettings, ...DefaultFieldSettings },
  "Cascader": { ...CascaderSettings, ...DefaultFieldSettings },
  "FormTable": { ...FormTableSettings, ...DefaultFieldSettings },
  "Divider": DividerSettings,
  "Alert": AlertSettings,
  "RichText": RichTextSettings,
  "RichEditor": DefaultFieldSettings,
  "Grid.Row": GridRowSettings,
  "Grid.Col": GridColSettings,
}

export default configSettings;
