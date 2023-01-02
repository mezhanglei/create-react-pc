import { Col, Input, Row, Select } from "antd";
import classNames from "classnames";
import React, { CSSProperties, LegacyRef, useState } from "react";
import { Form } from "..";
import { EditorSourceModal } from "./editor";

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
  onChange?: (val: RequestSourceConfig) => void;
  className?: string;
  style?: CSSProperties;
}

const prefixCls = 'request-source';
const classes = {
  cls: prefixCls
}

const RequestSource: React.FC<RequestSourceProps> = React.forwardRef((props, ref: LegacyRef<HTMLElement>) => {

  const {
    value,
    onChange,
    className,
    ...rest
  } = props;

  const labelWidth = 80;
  const [requestConfig, setRequestConfig] = useState<RequestSourceProps>({});

  return (
    <div className={classNames(classes.cls, className)} {...rest}>
      <Row>
        <Col span={24}>
          <Form.Item required label="接口" layout="horizontal" labelWidth={labelWidth}>
            <Input style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label="请求方式" layout="horizontal" labelWidth={labelWidth}>
            <Select style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label="提交方式" layout="horizontal" labelWidth={labelWidth}>
            <Select style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label="请求参数" layout="horizontal" labelWidth={labelWidth}>
            <EditorSourceModal />
          </Form.Item>
        </Col>
      </Row>
      <Col span={24}>
        <Form.Item label="header信息" layout="horizontal" labelWidth={labelWidth}>
          <EditorSourceModal />
        </Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item label="解析函数" layout="horizontal" labelWidth={labelWidth}>
          <Input.TextArea style={{ width: '100%' }} />
        </Form.Item>
      </Col>
    </div>
  );
});

export default RequestSource;
