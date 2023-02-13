import React, { LegacyRef, useState } from "react";
import './style.less';
import Icon from "@/components/svg-icon";
import Tooltip from "@/components/tooltip";
import RenderForm, { useFormStore } from '../..';
import { Button } from "antd";


interface CurrentValue {
  max?: number | string;
  min?: number | string;
  message?: string
}

export interface MinOrMaxComponentProps {
  name?: string;
  label?: string;
  value?: CurrentValue;
  onChange?: (val: CurrentValue) => void;
}

const prefixCls = 'rules-item-setting';
const classes = {
  item: prefixCls,
  label: `${prefixCls}-label`,
  text: `${prefixCls}-text`,
  icon: `${prefixCls}-icon`,
  tooltip: `${prefixCls}-tooltip`,
  tooltipContent: `${prefixCls}-tooltip-content`,
  confirm: `${prefixCls}-confirm`,
}

const MinOrMaxComponent: React.FC<MinOrMaxComponentProps> = React.forwardRef((props, ref: LegacyRef<HTMLDivElement>) => {

  const {
    label,
    value,
    onChange,
    name,
    ...rest
  } = props;

  const SelectOptions = [{ label: '手动设置', value: 'handle' }, { label: '联动设置', value: 'linkage' }]
  const currentForm = useFormStore();
  const [properties, setProperties] = useState(name ? {
    selectType: {
      label: '赋值方式',
      layout: 'horizontal',
      labelWidth: 80,
      initialValue: 'handle',
      type: 'Select',
      props: {
        style: { width: '100%' },
        options: SelectOptions
      }
    },
    target: {
      label: '数值',
      layout: 'horizontal',
      initialValue: value?.[name],
      labelWidth: 80,
      hidden: "{{formvalues && formvalues.selectType == 'linkage'}}",
      type: 'InputNumber',
      props: {
      }
    },
    expression: {
      label: '联动条件',
      layout: 'horizontal',
      initialValue: value?.[name],
      labelWidth: 80,
      hidden: "{{formvalues && formvalues.selectType == 'handle'}}",
      typeRender: '暂不开发'
      // type: 'Input',
      // props: {
      // }
    },
    message: {
      label: '提示信息',
      layout: 'horizontal',
      initialValue: value?.['message'],
      labelWidth: 80,
      type: 'Input',
      props: {
      }
    },
  } : undefined);

  const confirm = () => {
    const { target, expression, message } = currentForm.getFieldValue() || {}
    if (name) {
      const result = { [name]: target ?? expression, message }
      onChange && onChange(result)
    }
  }

  const renderContent = () => {
    return (
      <div className={classes.tooltipContent}>
        <RenderForm
          tagName="div"
          form={currentForm}
          properties={properties}
        />
        <div className={classes.confirm}>
          <Button onClick={confirm}>确认</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.item} ref={ref}>
      <div className={classes.label}>{label}</div>
      <div className={classes.text}></div>
      <Tooltip
        className={classes.tooltip}
        appendTo={document.body}
        placement="left"
        theme="light"
        content={renderContent()}
        trigger="click"
      >
        <Icon className={classes.icon} name="edit" />
      </Tooltip>
    </div>
  );
});

export default MinOrMaxComponent;