import { Select } from "antd";
import React, { useMemo } from "react";
import OptionsList from './OptionsList';
import OptionsRequest from './OptionsRequest';
import './index.less';
import OptionsDynamicSetting from "./OptionsDynamic";
import { EditorCodeMirror } from "../CodeMirror";
import { getArrMap } from "@/utils/array";
import { GenerateParams, joinFormPath } from "../..";
import { getEditorFormItem } from "../../utils/utils";
import { ELementProps } from "..";

/**
 * 数据源的配置组件。
 */

export interface SetOptionsProps extends GenerateParams<ELementProps> {
  value?: any;
  onChange?: (val: any) => void;
  includes?: string[]; // 当前可用模块
}

const prefixCls = 'option-source';
const classes = {
  type: `${prefixCls}-type`,
  component: `${prefixCls}-component`
};

const OptionsComponents = [
  { value: 'list', label: '选项数据', component: OptionsList },
  { value: 'json', label: '静态数据', component: EditorCodeMirror },
  { value: 'request', label: '接口请求', component: OptionsRequest },
  { value: 'dynamic', label: '联动设置', component: OptionsDynamicSetting },
]

const OptionsComponentsMap = getArrMap(OptionsComponents, 'value');

// type OptionsTypes = (typeof OptionsComponents)[number]['value'];

const SetOptions: React.FC<SetOptionsProps> = (props) => {

  const {
    includes = ['list', 'json', 'request', 'dynamic'],
    value,
    onChange,
    ...rest
  } = props;

  const { selected, editor } = rest?.field?.context || {};
  const buttons = useMemo(() => (OptionsComponents?.filter((item) => includes?.includes(item?.value))), [includes])
  const defaultKey = buttons[0]?.value;
  const optionsType = getEditorFormItem(editor, selected?.path, joinFormPath(selected?.attributeName, 'props.optionsType')) || defaultKey;

  const selectTypeChange = (key?: string) => {
    if (key) {
      onChange && onChange(undefined);
      editor?.updateItemByPath(key, selected?.path, joinFormPath(selected?.attributeName, 'props.optionsType'));
    }
  }

  const handleChange = (value: unknown) => {
    if (!optionsType) return;
    onChange && onChange(value);
  }

  const Child = optionsType && OptionsComponentsMap[optionsType]?.component as any;

  return (
    <>
      <div className={classes.type}>
        <Select value={optionsType} style={{ width: "100%" }} options={buttons} onChange={selectTypeChange} />
      </div>
      <div className={classes.component}>
        {Child ? <Child value={value} onChange={handleChange} {...rest} /> : null}
      </div>
    </>
  );
};

export default SetOptions;
