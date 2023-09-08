import { Select } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import OptionsList from './list';
import { EditorCodeMirror } from './editor';
import RequestSource from './request';
import './index.less';
import { LinkageBtn } from "../linkage";

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

const OptionsComponent = React.forwardRef<HTMLElement, OptionsComponentProps>((props, ref) => {

  const {
    includes = ['list', 'json', 'request', 'linkage'],
    value,
    onChange,
    ...rest
  } = props;

  const buttons = useMemo(() => ([
    { value: 'list', label: '选项数据' },
    { value: 'json', label: '静态数据' },
    { value: 'request', label: '接口请求' },
    { value: 'linkage', label: '联动设置' },
  ]?.filter((item) => includes?.includes(item?.value))), [includes])

  const [tab, setTab] = useState<string>();
  const [dataMap, setDataMap] = useState<any>({});

  // 接受外部赋值
  const defaultTab = buttons[0]?.value;
  useEffect(() => {
    setTab(defaultTab);
    setDataMap({ [defaultTab]: value });
  }, [defaultTab]);

  const selectTypeChange = (key?: string) => {
    setTab(key);
    if (key) {
      onChange && onChange(dataMap[key]);
    }
  }

  const dataChange = (key: string, data: any) => {
    setDataMap((old: any) => ({ ...old, [key]: data }));
    onChange && onChange(data);
    setTab(key);
  }

  const ComponentMap = {
    list: <OptionsList value={dataMap['list']} onChange={(val) => dataChange('list', val)} {...rest} />,
    json: <EditorCodeMirror value={dataMap['json']} onChange={(val) => dataChange('json', val)} {...rest} />,
    request: <RequestSource />,
    linkage: <LinkageBtn
      {...rest}
      value={dataMap['linkage']}
      onChange={(val) => dataChange('linkage', val)}
      controlField={{ type: 'CodeTextArea', }} />
  }

  const Component = tab && ComponentMap[tab];

  return (
    <>
      <div className={classes.tab}>
        <Select value={tab} style={{ width: "100%" }} options={buttons} onChange={selectTypeChange} />
      </div>
      <div className={classes.component}>
        {Component}
      </div>
    </>
  );
});

export default OptionsComponent;
