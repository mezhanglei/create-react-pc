import DefaultFieldSettings from "./field";
// 基础控件
import InputSettings from "./base/input";
import RadioSettings from "./base/radio";
import CheckboxSettings from './base/checkbox';
import SelectSettings from './base/select';
import SwitchSettings from './base/switch';
import TimePickerSettings from './base/timePicker';
import DatePickerSettings from './base/datePicker';
import SliderSettings from './base/slider';
import RateSettings from './base/rate';
import ColorPickerSettings from './base/colorPicker';
import FileUploadSettings from './base/fileUpload';
import ImageUploadSettings from './base/imageUpload';
import CascaderSettings from './base/cascader';
import AlertSettings from './base/alert';
import RichTextSettings from './base/richText';
// 布局组件
import GridRowSettings from './layout/grid-row';
import GridColSettings from './layout/grid-col';
// 容器组件
import FormTableColSettings from './container/table-col';
import { filterObject } from "@/utils/object";
// 业务组件

// 根据id获取配置
const getConfigSettingsById = (id?: string) => {
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
    case "DatePicker":
      return { ...DatePickerSettings, ...DefaultFieldSettings };
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

const getConfigSettings = (id?: string, subId?: string): any => {
  if (!id) return {};
  switch (id) {
    case "FormTableCol":
      const settings = getConfigSettingsById(subId);
      const needSettings = filterObject(settings, (key) => key !== '公共属性');
      return { ...needSettings, ...FormTableColSettings };
    default:
      return getConfigSettingsById(id);
  }
}

export default getConfigSettings;
