import { Select } from "antd";
import React, { LegacyRef, useEffect, useMemo, useState } from "react";
import OptionsList from './list';
import { EditorCodeMirror } from './editor';
import RequestSource from './request';
import './index.less';

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

const OptionsComponent: React.FC<OptionsComponentProps> = React.forwardRef((props, ref: LegacyRef<HTMLElement>) => {

  const {
    includes = ['list', 'json', 'request'],
    value,
    onChange,
    ...rest
  } = props;

  const buttons = useMemo(() => ([
    { value: 'list', label: '选项数据' },
    { value: 'json', label: '静态数据' },
    { value: 'request', label: '接口请求' },
  ]?.filter((item) => includes?.includes(item?.value))), [includes])

  const [tab, setTab] = useState<string>();

  useEffect(() => {
    setTab(buttons[0]?.value)
  }, [buttons[0]?.value])

  const ComponentMap = {
    list: <OptionsList value={value} onChange={onChange} {...rest} />,
    json: <EditorCodeMirror value={value} onChange={onChange} {...rest} />,
    request: <RequestSource />,
  }

  const Component = tab && ComponentMap[tab]

  return (
    <>
      <div className={classes.tab}>
        <Select value={tab} style={{ width: "100%" }} options={buttons} onChange={(val) => setTab(val)} />
        {/* <Radio.Group value={tab} buttonStyle="solid" onChange={(e) => setTab(e?.target?.value)}>
          {
            buttons?.map((item) => (<Radio.Button key={item?.value} value={item?.value}>{item?.label}</Radio.Button>))
          }
        </Radio.Group> */}
      </div>
      <div className={classes.component}>
        {Component}
      </div>
    </>
  );
});

export default OptionsComponent;
