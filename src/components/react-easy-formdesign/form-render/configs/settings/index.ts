import DefaultFieldSettings from "./field";
// 基础控件
import InputSettings from "./input";
import RadioSettings from "./radio";
import CheckboxSettings from './checkbox';
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
import FormTableColSettings from './formTableCol';
import FormTableSettings from './formTable';
import { filterObject } from "@/utils/object";
import { PropertiesData } from "@/components/react-easy-formrender";
import { ELementProps } from "../components";
// 业务组件

export type SettingsType = { [key: string]: PropertiesData }
export type SettingsMapType = { [id: string]: SettingsType | ((item?: Partial<ELementProps>) => SettingsType) }

// 配置
const configSettingsMap = {
  "Input": { ...InputSettings, ...DefaultFieldSettings },
  "RadioGroup": { ...RadioSettings, ...DefaultFieldSettings },
  "CheckboxGroup": { ...CheckboxSettings, ...DefaultFieldSettings },
  "Select": { ...SelectSettings, ...DefaultFieldSettings },
  "Switch": { ...SwitchSettings, ...DefaultFieldSettings },
  "TimePicker": { ...TimePickerSettings, ...DefaultFieldSettings },
  "TimePickerRangePicker": { ...TimePickerRangePickerSettings, ...DefaultFieldSettings },
  "DatePicker": { ...DatePickerSettings, ...DefaultFieldSettings },
  "DatePickerRangePicker": { ...DatePickerRangePickerSettings, ...DefaultFieldSettings },
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
  "GridRow": GridRowSettings,
  "GridCol": GridColSettings,
  "FormTableCol": (item?: Partial<ELementProps>) => {
    // 额外的配置
    const additional = item?.additional;
    const additionalSettings = additional instanceof Array ? additional.reduce((preSettings: SettingsType, cur: string) => {
      const curSettings = configSettingsMap[cur] as SettingsType;
      return Object.assign(preSettings, curSettings);
    }, {}) : (typeof additional == 'string' && configSettingsMap[additional])
    const formSettings = filterObject<SettingsType>(additionalSettings, (key) => key !== '公共属性');
    return Object.assign({}, FormTableColSettings, formSettings);
  }
}

export default configSettingsMap;

// 转换配置
export const convertSettings = (settings: SettingsMapType[string], item?: Partial<ELementProps>) => {
  return typeof settings === 'function' ? settings(item) : settings;
}
