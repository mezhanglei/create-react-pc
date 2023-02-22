import DefaultFieldSettings from "./field";
import InputSettings, { input_operation, input_rule } from "./input";
import RadioSettings, { radio_operation, radio_rule } from "./radio";
import CheckboxSettings, { checkbox_operation, checkbox_rule } from './checkbox';
import SelectSettings, { select_operation, select_rule } from './select';
import SwitchSettings, { switch_operation, switch_rule } from './switch';
import TimePickerSettings, { timePicker_operation, timePicker_rule } from './timePicker';
import DatePickerSettings, { datePicker_operation, datePicker_rule } from './datePicker';
import SliderSettings, { slider_operation, slider_rule } from './sliderLine';
import RateSettings, { rate_operation, rate_rule } from './rate';
import ColorPickerSettings, { colorPicker_operation, colorPicker_rule } from './colorPicker';
import FileUploadSettings, { fileUpload_operation, fileUpload_rule } from './fileUpload';
import ImageUploadSettings, { imageUpload_operation, imageUpload_rule } from './imageUpload';
import CascaderSettings, { cascader_operation, cascader_rule } from './cascader';

// 控件的属性配置, 以控件的id作为键
const ConfigSettings = {
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
}

type ValueOf<T> = T[keyof T];
export type ConfigSettingsType = typeof ConfigSettings;
export type ConfigSettingsItem = ValueOf<ConfigSettingsType>;
export default ConfigSettings;
