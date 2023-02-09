import { isEmpty } from "@/utils/type";
import { Button, Col, Input, message, Row, Switch } from "antd";
import React, { ChangeEvent, LegacyRef, useEffect, useRef, useState } from "react";
import './required.less';
import Icon from "@/components/svg-icon";
import { Form } from "../..";
import Tooltip from "@/components/tooltip";

export interface RequiredComponentProps {
  name?: string;
  label?: string;
  value?: boolean | string;
  onChange?: (val: boolean | string) => void;
}

const prefixCls = 'required-item';
const classes = {
  item: prefixCls,
  label: `${prefixCls}-label`,
  text: `${prefixCls}-text`,
  tooltip: `${prefixCls}-tooltip`,
  tooltipContent: `${prefixCls}-tooltip-content`,
}

const RequiredComponent: React.FC<RequiredComponentProps> = React.forwardRef((props, ref: LegacyRef<HTMLDivElement>) => {

  const {
    label,
    value,
    onChange,
    name,
    ...rest
  } = props;

  const labelWidth = 80;
  const iconRef = useRef<SVGSVGElement>(null)
  const [values, setValues] = useState();

  const handleChange = (key: string, val: any) => {

  }

  const addItem = () => {
    
  }

  const renderContent = () => {
    return (
      <div className={classes.tooltipContent}>
        <Row>
          <Col span={24}>
            <Form.Item label="启用" layout="horizontal" labelWidth={labelWidth}>
              <Switch onChange={(val) => console.log(val)} />
            </Form.Item>
          </Col>
          <Col span={24}>
            {/* <Form.Item label="联动条件" compact layout="horizontal" labelWidth={labelWidth}>
              <Button type="link" onClick={addItem}>
                添加选项
              </Button>
            </Form.Item> */}
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div className={classes.item} ref={ref}>
      <div className={classes.label}>{label}</div>
      <div className={classes.text}>1111</div>
      <Tooltip
        className={classes.tooltip}
        appendTo={document.body}
        placement="left"
        theme="light"
        content={renderContent()}
        trigger="click"
      >
        <Icon name="edit" ref={iconRef} />
      </Tooltip>
    </div>
  );
});

export default RequiredComponent;
