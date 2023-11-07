import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import Icon from "@/components/SvgIcon";
import RenderForm, { useFormStore, useFormValues } from '../../';
import './rule-item.less';
import CustomModal from "@/components/AntdModal";
import { ELementProps } from "../";
import { DynamicSettingBtn } from "../DynamicSetting";
import classNames from "classnames";

export interface InputFormRule {
  max?: number | string;
  min?: number | string;
  pattern?: boolean | string;
  required?: boolean | string;
  message?: string
}

export interface RuleItemRefs {
  showRuleModal: () => void
}

export interface RuleItemProps {
  name?: keyof InputFormRule;
  ruleName?: string;
  ruleField?: ELementProps;
  value?: InputFormRule;
  onChange?: (val?: InputFormRule) => void;
  className?: string;
}

const prefixCls = 'rules-item-setting';
const classes = {
  item: prefixCls,
  label: `${prefixCls}-label`,
  message: `${prefixCls}-message`,
  edit: `${prefixCls}-edit`,
  icon: `${prefixCls}-icon`,
}

const SelectOptions = [
  { label: '手动设置', value: 'handle' },
  { label: '联动设置', value: 'dynamic' }
];

const RuleItem = React.forwardRef<RuleItemRefs, RuleItemProps>((props, ref) => {

  const {
    ruleName,
    value,
    onChange,
    name,
    ruleField,
    className,
    ...rest
  } = props;

  const { label, ...restField } = ruleField || {};
  const [ruleValue, setRuleValue] = useState<InputFormRule>();
  const editRef = useRef<any>();
  const currentForm = useFormStore();
  const { selectType } = useFormValues<{ selectType: string }>(currentForm, ['selectType']) || {};

  useImperativeHandle(ref, () => ({ showRuleModal: () => editRef.current.click() }))

  const properties = name ? {
    selectType: {
      label: '设置类型',
      layout: 'horizontal',
      labelWidth: 80,
      initialValue: 'handle',
      type: 'Select',
      props: {
        style: { width: '100%' },
        options: SelectOptions
      }
    },
    [name]: selectType === 'dynamic' ? {
      label: '联动条件',
      layout: 'horizontal',
      rules: [{ required: true, message: '请输入' }],
      labelWidth: 80,
      typeRender: <DynamicSettingBtn controlField={restField} />
    } : {
      ...ruleField,
      rules: [{ required: true, message: '请输入' }],
      layout: 'horizontal',
      labelWidth: 80,
    },
    message: {
      label: '提示信息',
      layout: 'horizontal',
      rules: [{ required: true, message: '请输入' }],
      labelWidth: 80,
      type: 'Input',
      props: {
      }
    },
  } : undefined;

  useEffect(() => {
    setRuleValue(value);
  }, [value]);

  // 给弹窗的表单赋值
  const setRuleModal = (data?: InputFormRule) => {
    if (name && data?.[name] !== undefined) {
      currentForm.setFieldsValue(data);
    } else {
      currentForm.setFieldsValue({});
    }
  }

  const clickEdit = (showModal: () => void) => {
    showModal();
    console.log(value, 2222)
    setRuleModal(value);
  }

  const handleOk = async (closeModal: () => void) => {
    const { error, values } = await currentForm.validate();
    if (error) return;
    setRuleValue(values);
    onChange && onChange(values);
    closeModal();
  }

  const clearValue = () => {
    onChange && onChange();
    setRuleValue(undefined);
  }

  const cls = classNames(classes.item, className)

  return (
    <div className={cls}>
      <CustomModal title="校验规则" onOk={handleOk} displayElement={
        (showModal) => (
          <div className={classes.label}>
            <label className={classes.edit}>
              {ruleName}
            </label>
            <span ref={editRef} onClick={() => clickEdit(showModal)}>
              <Icon className={classes.icon} title="编辑" name="edit" />
            </span>
            {name && ruleValue && <Icon className={classes.icon} onClick={clearValue} title="清除" name="qingchu" />}
          </div>
        )
      }>
        <RenderForm
          tagName="div"
          form={currentForm}
          properties={properties}
        />
      </CustomModal>
    </div>
  );
});

export default RuleItem;
