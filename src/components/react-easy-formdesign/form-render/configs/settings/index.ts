import DefaultFieldSettings from "./field";
// 基础控件
import InputSettings from "./base/input";
import RadioSettings from "./base/radio";
import CheckboxSettings from './base/checkbox';
import SelectSettings from './base/select';
import SwitchSettings from './base/switch';
import TimePickerSettings from './base/timePicker';
import TimePickerRangePickerSettings from './base/timePickerRangePicker';
import DatePickerSettings from './base/datePicker';
import DatePickerRangePickerSettings from './base/datePickerRangePicker';
import SliderSettings from './base/slider';
import RateSettings from './base/rate';
import ColorPickerSettings from './base/colorPicker';
import FileUploadSettings from './base/fileUpload';
import ImageUploadSettings from './base/imageUpload';
import CascaderSettings from './base/cascader';
import RichTextSettings from './base/richText';
// 布局组件
import GridRowSettings from './layout/grid-row';
import GridColSettings from './layout/grid-col';
import DividerSettings from './layout/divider';
import AlertSettings from './layout/alert';
// 组合组件
import FormTableColSettings from './combo/form-table-col';
import FormTableSettings from './combo/form-table';
import { filterObject } from "@/utils/object";
import { PropertiesData } from "@/components/react-easy-formrender";
// 业务组件

// 基础配置
const baseSettings = {
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

const getConfigSettings = (id?: string, subId?: string): { [key: string]: PropertiesData } | undefined => {
  if (!id) return {};
  switch (id) {
    case "FormTableCol":
      const settings = subId && baseSettings[subId];
      const needSettings = filterObject(settings, (key) => key !== '公共属性');
      return Object.assign({}, FormTableColSettings, needSettings);
    default:
      return baseSettings[id];
  }
}

export default getConfigSettings;
