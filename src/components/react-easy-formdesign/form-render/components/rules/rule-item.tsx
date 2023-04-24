import React, { useEffect, useState } from "react";
import Icon from "@/components/svg-icon";
import Tooltip from "@/components/tooltip";
import RenderForm, { useFormStore, useFormValues } from '../../../form-render';
import { Button } from "antd";
import { ControlFieldProps, LinkageBtn } from "../linkage";
import { matchExpression } from "@/components/react-easy-formrender/utils/utils";
import './style.less';

interface CurrentValue {
  max?: number | string;
  min?: number | string;
  pattern?: boolean | string;
  required?: boolean | string;
  message?: string
}

export interface RuleItemProps extends ControlFieldProps {
  name?: string;
  label?: string;
  controlLabel: string;
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

const RuleItem = React.forwardRef<HTMLDivElement, RuleItemProps>((props, ref) => {

  const {
    label,
    value,
    onChange,
    name,
    controlLabel,
    controlField,
    ...rest
  } = props;

  const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);
  const SelectOptions = [{ label: '手动设置', value: 'handle' }, { label: '联动设置', value: 'linkage' }];
  const currentForm = useFormStore();
  const formvalues = useFormValues<{ selectType: string }>(currentForm, ['selectType']);
  const selectType = formvalues?.['selectType'];
  const currentMessage = value?.['message'];
  const ruleValue = name ? value?.[name] : undefined;
  const [ruleValueMap, setRuleValueMap] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    if (name) {
      const matchStr = matchExpression(ruleValue);
      if (matchStr) {
        setRuleValueMap({ linkage: ruleValue });
        currentForm.setFieldValue({ selectType: 'linkage', [name]: ruleValue, message: currentMessage });
      } else {
        setRuleValueMap({ handle: ruleValue });
        currentForm.setFieldValue({ selectType: 'handle', [name]: ruleValue, message: currentMessage });
      }
    }
  }, [value]);

  const dataChange = (type: 'handle' | 'linkage', data: any) => {
    setRuleValueMap((old) => ({ ...old, [type]: data }));
  }

  const selectTypeChange = (key: string) => {
    if (key && name) {
      currentForm.setFieldValue({ [name]: ruleValueMap[key], });
    }
  }

  const properties = name ? {
    selectType: {
      label: '赋值方式',
      layout: 'horizontal',
      labelWidth: 80,
      initialValue: 'handle',
      type: 'Select',
      onFieldsChange: selectTypeChange,
      props: {
        style: { width: '100%' },
        options: SelectOptions
      }
    },
    [name]: selectType === 'linkage' ? {
      label: '联动条件',
      layout: 'horizontal',
      initialValue: ruleValueMap[selectType],
      labelWidth: 80,
      onFieldsChange: (data: any) => dataChange('linkage', data),
      typeRender: <LinkageBtn controlField={controlField} />
    } : {
      label: controlLabel,
      layout: 'horizontal',
      initialValue: selectType && ruleValueMap[selectType],
      onFieldsChange: (data: any) => dataChange('handle', data),
      labelWidth: 80,
      ...controlField
    },
    message: {
      label: '提示信息',
      layout: 'horizontal',
      initialValue: currentMessage,
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
      onChange && onChange(result);
    }
    setTooltipVisible(false);
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

  const showTooltip = () => {
    setTooltipVisible(!tooltipVisible);
  }

  return (
    <div className={classes.item} ref={ref}>
      <div className={classes.label}>{label}</div>
      <div className={classes.text}>
        <div className={classes.message} title={currentMessage}>{currentMessage}</div>
      </div>
      <Tooltip
        visible={tooltipVisible}
        className={classes.tooltip}
        appendTo={document.body}
        placement="left"
        theme="light"
        content={renderContent()}
      >
        <Icon className={classes.icon} onClick={showTooltip} name="edit" />
      </Tooltip>
    </div>
  );
});

export default RuleItem;
