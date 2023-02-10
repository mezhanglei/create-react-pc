import { isEmpty } from "@/utils/type";
import { Button, Col, Input, message, Row, Select, Switch } from "antd";
import React, { ChangeEvent, LegacyRef, useEffect, useRef, useState } from "react";
import './required.less';
import Icon from "@/components/svg-icon";
import { Form } from "../..";
import Tooltip from "@/components/tooltip";
import RenderForm, { RenderFormProps, useFormStore } from '../../../form-render';

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
  const SelectOptions = [{ label: '手动赋值', value: 1 }, { label: '联动赋值', value: 2 }]
  const iconRef = useRef<SVGSVGElement>(null)
  const [values, setValues] = useState();
  const currentForm = useFormStore();
  const [properties, setProperties] = useState({
    selectType: {
      label: '赋值方式',
      layout: 'horizontal',
      labelWidth: 80,
      initialValue: 1,
      type: 'Select',
      props: {
        style: { width: '100%' },
        options: SelectOptions
      }
    },
    switch: {
      label: '启用',
      layout: 'horizontal',
      labelWidth: 80,
      hidden: "{{formvalues && formvalues.selectType == 2}}",
      type: 'Switch',
      props: {
      }
    }
  })

  const handleChange: RenderFormProps['onFieldsChange'] = ({ name, value }) => {
    console.log(name, value, 2222)
  }

  const renderContent = () => {
    return (
      <div className={classes.tooltipContent}>
        <RenderForm
          tagName="div"
          form={currentForm}
          properties={properties}
          onValuesChange={handleChange}
        />
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
