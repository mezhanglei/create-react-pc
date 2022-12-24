import { ValueOf } from "@/components/react-easy-formrender";
import DefaultFieldSettings from "./field";

// 公共的表单控件属性配置, 以控件的id作为键
const CommonSettings = {
  input: [DefaultFieldSettings]
}

export type CommonSettingsType = typeof CommonSettings;
export type CommonSettingsItem = ValueOf<CommonSettingsType>;
export default CommonSettings