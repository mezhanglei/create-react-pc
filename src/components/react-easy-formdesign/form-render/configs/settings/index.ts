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

// 静态配置
const staticSettingsMap = {
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
}

// 动态配置
const dynamicSettingsMap = {
  "FormTableCol": (item?: Partial<ELementProps>) => {
    const additional = item?.additional; // 节点额外的组件id
    const formSettings = filterObject<SettingsType>(getStaticSettings(additional), (key) => key !== '公共属性');
    return Object.assign({}, FormTableColSettings, formSettings);
  }
}

const originSettingsMap = { ...staticSettingsMap, ...dynamicSettingsMap };

export default originSettingsMap;

// 获取静态配置
export const getStaticSettings = (ids?: string | Array<string>) => {
  if (ids instanceof Array) {
    return ids.reduce((preSettings: SettingsType, cur: string) => {
      const curSettings = staticSettingsMap[cur] as SettingsType;
      return Object.assign(preSettings, curSettings);
    }, {});
  } else if (typeof ids === 'string') {
    return staticSettingsMap[ids] as SettingsType;
  }
}

// 配置需要转换才能使用
export const handleSettings = (settings: SettingsMapType[string], item?: Partial<ELementProps>) => {
  return typeof settings === 'function' ? settings(item) : settings;
}
