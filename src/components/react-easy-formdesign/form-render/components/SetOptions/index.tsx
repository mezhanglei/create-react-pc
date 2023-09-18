import { Select } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import OptionsList from './OptionsList';
import OptionsRequest from './OptionsRequest';
import './index.less';
import OptionsDynamicSetting from "./OptionsDynamic";
import { EditorCodeMirror } from "../CodeMirror";
import { getArrMap } from "@/utils/array";
import { GeneratePrams } from "../..";
import { ELementProps } from "..";
import { isObject } from "@/utils/type";
import { matchExpression } from "@/components/react-easy-formrender/utils/utils";

/**
 * 数据源的配置组件。
 */

export interface SetOptionsProps extends GeneratePrams<ELementProps> {
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

type OptionsTypes = (typeof OptionsComponents)[number]['value'];

const SetOptions: React.FC<SetOptionsProps> = (props) => {

  const {
    includes = ['list', 'json', 'request', 'dynamic'],
    value,
    onChange,
    ...rest
  } = props;

  const buttons = useMemo(() => (OptionsComponents?.filter((item) => includes?.includes(item?.value))), [includes])
  const defaultKey = buttons[0]?.value;

  const [current, setCurrent] = useState<OptionsTypes>();

  // 值对应的类型
  const currentKey = useMemo(() => {
    if (value instanceof Array) {
      return 'list';
    } else if (isObject(value)) {
      return 'request';
    } else if (typeof value === 'string') {
      const matchStr = matchExpression(value);
      if (matchStr) {
        return 'dynamic'
      } else {
        return 'json'
      }
    }
    return defaultKey;
  }, [value, defaultKey]);

  // 初始值
  useEffect(() => {
    setCurrent(currentKey);
  }, [currentKey]);

  const selectTypeChange = (key?: string) => {
    setCurrent(key);
    if (key) {
      onChange && onChange(undefined);
    }
  }

  const handleChange = (value: unknown) => {
    if (!current) return;
    onChange && onChange(value);
  }

  const Child = current && OptionsComponentsMap[current]?.component as any;

  return (
    <>
      <div className={classes.type}>
        <Select value={current} style={{ width: "100%" }} options={buttons} onChange={selectTypeChange} />
      </div>
      <div className={classes.component}>
        {Child ? <Child value={value} onChange={handleChange} /> : null}
      </div>
    </>
  );
};

export default SetOptions;
