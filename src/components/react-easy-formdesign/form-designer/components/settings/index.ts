import DefaultFieldSettings from "./field";
import InputSettings, { input_operation } from "./input";
import RadioSettings, { radio_operation } from "./radio";
import CheckboxSettings, { checkbox_operation } from './checkbox';
import SelectSettings, { select_operation } from './select';
import SwitchSettings, { switch_operation } from './switch';
import TimePickerSettings, { timePicker_operation } from './timePicker';
import DatePickerSettings, { datePicker_operation } from './datePicker';
import SliderSettings, { slider_operation } from './sliderLine';
import RateSettings, { rate_operation } from './rate';
import ColorPickerSettings, { colorPicker_operation } from './colorPicker';
import FileUploadSettings, { fileUpload_operation } from './fileUpload';
import ImageUploadSettings, { imageUpload_operation } from './imageUpload';
import CascaderSettings, { cascader_operation } from './cascader';
import RulesSettings from "./rules";

// 控件的属性配置, 以控件的id作为键
const ConfigSettings = {
  input: [InputSettings, input_operation, RulesSettings, DefaultFieldSettings],
  radio: [RadioSettings, radio_operation, DefaultFieldSettings],
  checkbox: [CheckboxSettings, checkbox_operation, DefaultFieldSettings],
  select: [SelectSettings, select_operation, DefaultFieldSettings],
  switch: [SwitchSettings, switch_operation, DefaultFieldSettings],
  timePicker: [TimePickerSettings, timePicker_operation, DefaultFieldSettings],
  datePicker: [DatePickerSettings, datePicker_operation, DefaultFieldSettings],
  slider: [SliderSettings, slider_operation, DefaultFieldSettings],
  rate: [RateSettings, rate_operation, DefaultFieldSettings],
  colorPicker: [ColorPickerSettings, colorPicker_operation, DefaultFieldSettings],
  fileupload: [FileUploadSettings, fileUpload_operation, DefaultFieldSettings],
  imageupload: [ImageUploadSettings, imageUpload_operation, DefaultFieldSettings],
  cascader: [CascaderSettings, cascader_operation, DefaultFieldSettings],
}

type ValueOf<T> = T[keyof T];
export type ConfigSettingsType = typeof ConfigSettings;
export type ConfigSettingsItem = ValueOf<ConfigSettingsType>;
export default ConfigSettings;
