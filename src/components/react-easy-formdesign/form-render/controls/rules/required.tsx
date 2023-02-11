import React, { LegacyRef, useState } from "react";
import './required.less';
import Icon from "@/components/svg-icon";
import Tooltip from "@/components/tooltip";
import RenderForm, { useFormStore } from '../../../form-render';
import { Button } from "antd";


interface CurrentValue {
  required?: boolean | string;
  message?: string
}

export interface RequiredComponentProps {
  name?: string;
  label?: string;
  value?: CurrentValue;
  onChange?: (val: CurrentValue) => void;
}

const prefixCls = 'required-item';
const classes = {
  item: prefixCls,
  label: `${prefixCls}-label`,
  text: `${prefixCls}-text`,
  tooltip: `${prefixCls}-tooltip`,
  tooltipContent: `${prefixCls}-tooltip-content`,
  confirm: `${prefixCls}-confirm`,
}

const RequiredComponent: React.FC<RequiredComponentProps> = React.forwardRef((props, ref: LegacyRef<HTMLDivElement>) => {

  const {
    label,
    value = false,
    onChange,
    name,
    ...rest
  } = props;

  const SelectOptions = [{ label: '手动赋值', value: 1 }, { label: '联动赋值', value: 2 }]
  const currentForm = useFormStore();
  const [properties, setProperties] = useState(name ? {
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
    flag: {
      label: '启用',
      layout: 'horizontal',
      initialValue: value,
      labelWidth: 80,
      hidden: "{{formvalues && formvalues.selectType == 2}}",
      type: 'Switch',
      props: {
      }
    },
    expression: {
      label: '联动条件',
      layout: 'horizontal',
      initialValue: value,
      labelWidth: 80,
      hidden: "{{formvalues && formvalues.selectType == 1}}",
      typeRender: '暂不开发'
      // type: 'Input',
      // props: {
      // }
    },
    message: {
      label: '提示信息',
      layout: 'horizontal',
      initialValue: '请输入',
      labelWidth: 80,
      type: 'Input',
      props: {
      }
    },
  } : undefined);

  const confirm = () => {
    const { flag, expression, message } = currentForm.getFieldValue() || {}
    name && onChange && onChange({ [name]: flag ?? expression, message })
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
        <Icon name="edit" />
      </Tooltip>
    </div>
  );
});

export default RequiredComponent;
