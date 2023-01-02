import { Radio } from "antd";
import React, { LegacyRef, useMemo, useState } from "react";
import TableSource from './options';
import EditorSource from './editor';
import RequestSource, {RequestSourceConfig} from './request';
import './index.less';

/**
 * 数据源的配置组件。
 */

export interface OptionsProps {
  value?: { [x: string]: any }[]
  onChange?: (val: { [x: string]: any }[]) => void;
}

export interface DataSourceComponentProps extends OptionsProps {
  includes?: string[]; // 当前可用模块
  module?: string; // 当前所选的组件类型
  requestConfig?: RequestSourceConfig; // request组件的请求配置
}

const prefixCls = 'option-source'
const classes = {
  tab: `${prefixCls}-tab`,
  component: `${prefixCls}-component`
}

const DataSourceComponent: React.FC<DataSourceComponentProps> = React.forwardRef((props, ref: LegacyRef<HTMLElement>) => {

  const {
    includes = ['table', 'json', 'request'],
    module,
    value,
    onChange,
    requestConfig,
    ...rest
  } = props;

  const buttons = useMemo(() => ([
    { value: 'table', label: '表格数据' },
    { value: 'json', label: '静态数据' },
    { value: 'request', label: '接口请求' },
  ]?.filter((item) => includes?.includes(item?.value))), [includes])

  const [tab, setTab] = useState<string>(module || buttons[0]?.value);

  const ComponentMap = {
    table: <TableSource value={value} onChange={onChange} {...rest} />,
    json: <EditorSource value={value} onChange={onChange} {...rest} />,
    request: <RequestSource value={requestConfig} />,
  }

  const Component = ComponentMap[tab]

  return (
    <>
      <div className={classes.tab}>
        <Radio.Group defaultValue={tab} buttonStyle="solid" onChange={(e) => setTab(e?.target?.value)}>
          {
            buttons?.map((item) => (<Radio.Button key={item?.value} value={item?.value}>{item?.label}</Radio.Button>))
          }
        </Radio.Group>
      </div>
      <div className={classes.component}>
        {Component}
      </div>
    </>
  );
});

export default DataSourceComponent;
