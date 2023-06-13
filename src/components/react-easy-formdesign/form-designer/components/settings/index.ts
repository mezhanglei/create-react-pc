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

// 获取单一控件的配置
const getControlSettings = (id?: string) => {
  if (!id) return {};
  switch (id) {
    case "Input":
      return { ...InputSettings, ...DefaultFieldSettings };
    case "RadioGroup":
      return { ...RadioSettings, ...DefaultFieldSettings };
    case "CheckboxGroup":
      return { ...CheckboxSettings, ...DefaultFieldSettings };
    case "Select":
      return { ...SelectSettings, ...DefaultFieldSettings };
    case "Switch":
      return { ...SwitchSettings, ...DefaultFieldSettings };
    case "TimePicker":
      return { ...TimePickerSettings, ...DefaultFieldSettings };
    case "TimePickerRangePicker":
      return { ...TimePickerRangePickerSettings, ...DefaultFieldSettings };
    case "DatePicker":
      return { ...DatePickerSettings, ...DefaultFieldSettings };
    case "DatePickerRangePicker":
      return { ...DatePickerRangePickerSettings, ...DefaultFieldSettings };
    case "Slider":
      return { ...SliderSettings, ...DefaultFieldSettings };
    case "Rate":
      return { ...RateSettings, ...DefaultFieldSettings };
    case "ColorPicker":
      return { ...ColorPickerSettings, ...DefaultFieldSettings };
    case "FileUpload":
      return { ...FileUploadSettings, ...DefaultFieldSettings };
    case "ImageUpload":
      return { ...ImageUploadSettings, ...DefaultFieldSettings };
    case "Cascader":
      return { ...CascaderSettings, ...DefaultFieldSettings };
    case "FormTable":
      return { ...FormTableSettings, ...DefaultFieldSettings };
    case "Divider":
      return DividerSettings;
    case "Alert":
      return AlertSettings;
    case "RichText":
      return RichTextSettings;
    case "RichEditor":
      return DefaultFieldSettings;
    case "GridRow":
      return GridRowSettings;
    case "GridCol":
      return GridColSettings;
    default:
      break;
  }
}

const getConfigSettings = (id?: string, subId?: string): { [key: string]: PropertiesData } | undefined => {
  if (!id) return {};
  switch (id) {
    case "FormTableCol":
      const settings = getControlSettings(subId);
      const needSettings = filterObject(settings, (key) => key !== '公共属性');
      return { ...FormTableColSettings, ...needSettings };
    default:
      return getControlSettings(id);
  }
}

export default getConfigSettings;
