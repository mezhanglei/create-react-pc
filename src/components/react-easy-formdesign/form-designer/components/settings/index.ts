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
// 业务组件

const getConfigSettings = (id?: string, type?: string): any => {
  if (!id || !type) return {}
  if (id === type) {
    switch (id) {
      case "Input":
        return { ...InputSettings, ...DefaultFieldSettings };
      case "Radio.Group":
        return { ...RadioSettings, ...DefaultFieldSettings };
      case "Checkbox.Group":
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
      case "Grid.Row":
        return GridRowSettings;
      case "Grid.Col":
        return GridColSettings;
      default:
        break;
    }
  } else {
    return {}
  }
}

export default getConfigSettings;
