import { Col, Input, Row, Select } from "antd";
import classNames from "classnames";
import React, { CSSProperties, LegacyRef, useState } from "react";
import { Form } from "../../";
import { useFormDesign } from "../../../form-designer/utils/hooks";
import { updateDesignerItem } from "../../../form-designer/utils/utils";
import CodeTextArea from "../code-textarea";
import { EditorCodeMirrorModal } from "./editor";

export interface RequestSourceConfig {
  url?: string; // 请求的路径
  method?: string; // 请求方式
  requestType?: string; // 提交方式
  params?: any; // 参数
  headers?: any; // headers携带的信息
  returnFn?: string; // 解析函数
}

export interface RequestSourceProps {
  value?: RequestSourceConfig;
  onChange?: (val?: RequestSourceConfig) => void;
  className?: string;
  style?: CSSProperties;
}

const prefixCls = 'request-source';
const classes = {
  cls: prefixCls
}
const methodOptions = [
  { value: 'get', label: 'GET' },
  { value: 'post', label: 'POST' }
];
const requestTypeOptions = [
  { value: 'formData', label: 'FormData' },
  { value: 'json', label: 'JSON' }
];

const RequestSource: React.FC<RequestSourceProps> = React.forwardRef((props, ref: LegacyRef<HTMLElement>) => {

  const {
    value,
    onChange,
    className,
    ...rest
  } = props;

  const labelWidth = 80;
  const [requestConfig, setRequestConfig] = useState<RequestSourceConfig>({});
  const { selectedPath, designer, designerForm } = useFormDesign();

  const configChange = (key: string, val: any) => {
    const newConfig = { ...requestConfig };
    newConfig[key] = val;
    setRequestConfig(newConfig);
    onChange && onChange(newConfig);
    updateDesignerItem(designer, designerForm, selectedPath, { props: newConfig });
  }

  return (
    <div className={classNames(classes.cls, className)} {...rest}>
      <Row>
        <Col span={24}>
          <Form.Item required label="接口" layout="horizontal" labelWidth={labelWidth}>
            <Input style={{ width: '100%' }} onChange={(e) => configChange('url', e?.target?.value)} />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label="请求方式" layout="horizontal" labelWidth={labelWidth}>
            <Select style={{ width: '100%' }} options={methodOptions} onChange={(val) => configChange('method', val)} />
          </Form.Item>
        </Col>
        {
          requestConfig['method'] === 'post' &&
          <Col span={24}>
            <Form.Item label="提交方式" layout="horizontal" labelWidth={labelWidth}>
              <Select style={{ width: '100%' }} options={requestTypeOptions} onChange={(val) => configChange('requestType', val)} />
            </Form.Item>
          </Col>
        }
        <Col span={24}>
          <Form.Item label="请求参数" layout="horizontal" labelWidth={labelWidth}>
            <EditorCodeMirrorModal onChange={(val) => configChange('params', val)} />
          </Form.Item>
        </Col>
      </Row>
      <Col span={24}>
        <Form.Item label="header信息" layout="horizontal" labelWidth={labelWidth}>
          <EditorCodeMirrorModal onChange={(val) => configChange('headers', val)} />
        </Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item label="解析函数" layout="horizontal" labelWidth={labelWidth}>
          <CodeTextArea style={{ width: '100%' }} onChange={(val) => configChange('returnFn', val)} />
        </Form.Item>
      </Col>
    </div>
  );
});

export default RequestSource;
