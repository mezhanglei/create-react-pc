import { ValueOf } from "@/components/react-easy-formrender";
import DefaultFieldSettings from "./field";
import InputSettings from "./input";
import RadioSettings from "./radio";

// 控件的属性配置, 以控件的id作为键
const ConfigSettings = {
  input: [InputSettings, DefaultFieldSettings],
  radio: [RadioSettings, DefaultFieldSettings]
}

export type ConfigSettingsType = typeof ConfigSettings;
export type ConfigSettingsItem = ValueOf<ConfigSettingsType>;
export default ConfigSettings;
