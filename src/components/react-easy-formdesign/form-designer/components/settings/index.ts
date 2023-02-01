import { ValueOf } from "@/components/react-easy-formrender";
import DefaultFieldSettings from "./field";
import InputSettings from "./input";
import RadioSettings from "./radio";
import CheckboxSettings from './checkbox';
import SelectSettings from './select';
import SwitchSettings from './switch';
import TimePickerSettings from './timePicker';
import DatePickerSettings from './datePicker';
import SliderSettings from './sliderLine';
import RateSettings from './rate';
import ColorPickerSettings from './colorPicker';
import FileUploadSettings from './fileUpload';
import ImageUploadSettings from './imageUpload';
import CascaderSettings from './cascader';

// 控件的属性配置, 以控件的id作为键
const ConfigSettings = {
  input: [InputSettings, DefaultFieldSettings],
  radio: [RadioSettings, DefaultFieldSettings],
  checkbox: [CheckboxSettings, DefaultFieldSettings],
  select: [SelectSettings, DefaultFieldSettings],
  switch: [SwitchSettings, DefaultFieldSettings],
  timePicker: [TimePickerSettings, DefaultFieldSettings],
  datePicker: [DatePickerSettings, DefaultFieldSettings],
  slider: [SliderSettings, DefaultFieldSettings],
  rate: [RateSettings, DefaultFieldSettings],
  colorPicker: [ColorPickerSettings, DefaultFieldSettings],
  fileupload: [FileUploadSettings, DefaultFieldSettings],
  imageupload: [ImageUploadSettings, DefaultFieldSettings],
  cascader: [CascaderSettings, DefaultFieldSettings],
}

export type ConfigSettingsType = typeof ConfigSettings;
export type ConfigSettingsItem = ValueOf<ConfigSettingsType>;
export default ConfigSettings;
