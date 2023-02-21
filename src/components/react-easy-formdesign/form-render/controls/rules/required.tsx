import React, { LegacyRef, useEffect } from "react";
import Icon from "@/components/svg-icon";
import Tooltip from "@/components/tooltip";
import RenderForm, { useFormStore, useFormValues } from '../../../form-render';
import { Button } from "antd";
import { LinkageBtn } from "../linkage";
import { matchExpression } from "@/components/react-easy-formrender/utils/utils";
import './style.less';

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
  message: `${prefixCls}-message`,
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

  const SelectOptions = [{ label: '手动设置', value: 'handle' }, { label: '联动设置', value: 'linkage' }];
  const currentForm = useFormStore();
  const formvalues = useFormValues<{ selectType: string }>(currentForm, ['selectType']);
  const currentValue = name ? value?.[name] : undefined;
  const currentMessage = value?.['message'];

  useEffect(() => {
    if (name) {
      const matchStr = matchExpression(currentValue);
      if (matchStr) {
        currentForm.setFieldValue({ selectType: 'linkage', [name]: currentValue, message: currentMessage });
      } else {
        currentForm.setFieldValue({ selectType: 'handle', [name]: currentValue, message: currentMessage });
      }
    }
  }, [value]);

  const selectTypeChange = () => {
    name && currentForm.setFieldValue(name, undefined);
  }

  // 目标设置值的控件
  const currentControl = {
    valueProp: 'checked',
    type: 'Switch',
    props: {
    }
  };

  const properties = name ? {
    selectType: {
      label: '赋值方式',
      layout: 'horizontal',
      labelWidth: 80,
      initialValue: 'handle',
      onFieldsChange: selectTypeChange,
      type: 'Select',
      props: {
        style: { width: '100%' },
        options: SelectOptions
      }
    },
    [name]: formvalues?.['selectType'] === 'linkage' ? {
      label: '联动条件',
      layout: 'horizontal',
      initialValue: currentValue,
      labelWidth: 80,
      typeRender: <LinkageBtn currentControl={currentControl} />
    } : {
      label: '启用',
      layout: 'horizontal',
      initialValue: currentValue == true ? true : false,
      labelWidth: 80,
      ...currentControl
    },
    message: {
      label: '提示信息',
      layout: 'horizontal',
      initialValue: currentMessage ?? '请输入',
      rules: [{ required: true, message: '请输入' }],
      labelWidth: 80,
      type: 'Input',
      props: {
      }
    },
  } : undefined;

  const confirm = async () => {
    const { error, values } = await currentForm.validate();
    if (error) return;
    const { selectType, ...rest } = values || {}
    if (name) {
      const result = rest;
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
      <div className={classes.text}>
        <div className={classes.message} title={currentMessage}>{currentMessage}</div>
      </div>
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
