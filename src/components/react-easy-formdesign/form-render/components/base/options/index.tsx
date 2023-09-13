import { Select } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import OptionsList from './OptionsList';
import OptionsRequest from './OptionsRequest';
import './index.less';
import OptionsLinkage from "./OptionsLinkage";
import { EditorCodeMirror } from "../CodeMirror";
import { getArrMap } from "@/utils/array";

/**
 * 数据源的配置组件。
 */

export interface OptionsProps {
  value?: any;
  onChange?: (val: any) => void;
}

export interface OptionsComponentProps extends OptionsProps {
  includes?: string[]; // 当前可用模块
}

const prefixCls = 'option-source'
const classes = {
  tab: `${prefixCls}-tab`,
  component: `${prefixCls}-component`
}

const OptionsComponents = [
  { value: 'list', label: '选项数据', component: OptionsList },
  { value: 'json', label: '静态数据', component: EditorCodeMirror },
  { value: 'request', label: '接口请求', component: OptionsRequest },
  { value: 'linkage', label: '联动设置', component: OptionsLinkage },
]

const OptionsComponentsMap = getArrMap(OptionsComponents, 'value');

type OptionsTypes = (typeof OptionsComponents)[number]['value'];

const OptionsComponent: React.FC<OptionsComponentProps> = (props) => {

  const {
    includes = ['list', 'json', 'request', 'linkage'],
    value,
    onChange,
    ...rest
  } = props;

  const buttons = useMemo(() => (OptionsComponents?.filter((item) => includes?.includes(item?.value))), [includes])

  const [current, setCurrent] = useState<string>();
  const [optionsDataMap, setOptionsDataMap] = useState<{ [key in OptionsTypes]: unknown }>({});

  // 接受外部赋值
  const defaultKey = buttons[0]?.value;
  useEffect(() => {
    setCurrent(defaultKey);
    setOptionsDataMap({ [defaultKey]: value });
  }, [defaultKey]);

  const selectTypeChange = (key?: string) => {
    setCurrent(key);
    if (key) {
      onChange && onChange(optionsDataMap[key]);
    }
  }

  const handleChange = (value: unknown) => {
    if (!current) return;
    setOptionsDataMap((old) => ({ ...old, [current]: value }));
    onChange && onChange(value);
  }

  const Child = current && OptionsComponentsMap[current]?.component as any;

  return (
    <>
      <div className={classes.tab}>
        <Select value={current} style={{ width: "100%" }} options={buttons} onChange={selectTypeChange} />
      </div>
      <div className={classes.component}>
        {Child ? <Child value={optionsDataMap[current]} onChange={handleChange} /> : null}
      </div>
    </>
  )
};

export default OptionsComponent;
