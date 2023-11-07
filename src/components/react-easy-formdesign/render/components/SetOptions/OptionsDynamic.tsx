import React from "react";
import { DynamicSettingBtn, DynamicSettingRulesCodeStr } from "../DynamicSetting";

const OptionsDynamicSetting: React.FC<DynamicSettingRulesCodeStr> = (props) => {

  return <DynamicSettingBtn {...props} controlField={{ type: 'CodeTextArea', }} />
}

export default OptionsDynamicSetting;
