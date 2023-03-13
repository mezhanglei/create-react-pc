import DefaultFieldSettings from "./field";
// 基础控件
import InputSettings, { input_operation, input_rule } from "./base/input";
import RadioSettings, { radio_operation, radio_rule } from "./base/radio";
import CheckboxSettings, { checkbox_operation, checkbox_rule } from './base/checkbox';
import SelectSettings, { select_operation, select_rule } from './base/select';
import SwitchSettings, { switch_operation, switch_rule } from './base/switch';
import TimePickerSettings, { timePicker_operation, timePicker_rule } from './base/timePicker';
import DatePickerSettings, { datePicker_operation, datePicker_rule } from './base/datePicker';
import SliderSettings, { slider_operation, slider_rule } from './base/slider';
import RateSettings, { rate_operation, rate_rule } from './base/rate';
import ColorPickerSettings, { colorPicker_operation, colorPicker_rule } from './base/colorPicker';
import FileUploadSettings, { fileUpload_operation, fileUpload_rule } from './base/fileUpload';
import ImageUploadSettings, { imageUpload_operation, imageUpload_rule } from './base/imageUpload';
import CascaderSettings, { cascader_operation, cascader_rule } from './base/cascader';
import AlertSettings, { alert_operation } from './base/alert';
// 布局组件
import RowSettings from './layout/row';
import ColSettings from './layout/col';
// 业务组件
// import Settings, { _operation } from './business/alert';

// 控件的属性配置, 以控件的id作为键
const ConfigSettings = {
  // 基础控件
  input: [InputSettings, input_operation, input_rule, DefaultFieldSettings],
  radio: [RadioSettings, radio_operation, radio_rule, DefaultFieldSettings],
  checkbox: [CheckboxSettings, checkbox_operation, checkbox_rule, DefaultFieldSettings],
  select: [SelectSettings, select_operation, select_rule, DefaultFieldSettings],
  switch: [SwitchSettings, switch_operation, switch_rule, DefaultFieldSettings],
  timePicker: [TimePickerSettings, timePicker_operation, timePicker_rule, DefaultFieldSettings],
  datePicker: [DatePickerSettings, datePicker_operation, datePicker_rule, DefaultFieldSettings],
  slider: [SliderSettings, slider_operation, slider_rule, DefaultFieldSettings],
  rate: [RateSettings, rate_operation, rate_rule, DefaultFieldSettings],
  colorPicker: [ColorPickerSettings, colorPicker_operation, colorPicker_rule, DefaultFieldSettings],
  fileupload: [FileUploadSettings, fileUpload_operation, fileUpload_rule, DefaultFieldSettings],
  imageupload: [ImageUploadSettings, imageUpload_operation, imageUpload_rule, DefaultFieldSettings],
  cascader: [CascaderSettings, cascader_operation, cascader_rule, DefaultFieldSettings],
  alert: [AlertSettings, alert_operation],
  // 布局组件
  row: [RowSettings],
  col: [ColSettings],
  // 业务组件
}

type ValueOf<T> = T[keyof T];
export type ConfigSettingsType = typeof ConfigSettings;
export type ConfigSettingsItem = ValueOf<ConfigSettingsType>;
export default ConfigSettings;
