import React, { LegacyRef, useState } from "react";
import './style.less';
import Icon from "@/components/svg-icon";
import Tooltip from "@/components/tooltip";
import RenderForm, { useFormStore } from '../../../form-render';
import { Button } from "antd";
import { LinkageListModal } from "../linkage";


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

const RequiredComponent: React.FC<RequiredComponentProps> = React.forwardRef((props, ref: LegacyRef<HTMLDivElement>) => {

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
      label: '启用',
      layout: 'horizontal',
      initialValue: value?.[name],
      labelWidth: 80,
      hidden: "{{formvalues && formvalues.selectType == 'linkage'}}",
      valueProp: 'checked',
      type: 'Switch',
      props: {
      }
    },
    expression: {
      label: '联动条件',
      layout: 'horizontal',
      initialValue: value?.[name],
      labelWidth: 80,
      hidden: "{{formvalues && formvalues.selectType == 'handle'}}",
      typeRender: <LinkageListModal />
    },
    message: {
      label: '提示信息',
      layout: 'horizontal',
      initialValue: value?.['message'] ?? '请输入',
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
        hideOnClick="toggle"
      >
        <Icon className={classes.icon} name="edit" />
      </Tooltip>
    </div>
  );
});

export default RequiredComponent;
