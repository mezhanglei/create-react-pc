import React, { useEffect, useRef, useState } from "react";
import Icon from "@/components/SvgIcon";
import Tooltip from "@/components/tooltip";
import RenderForm, { useFormStore, useFormValues } from '../../../';
import { Button, Checkbox } from "antd";
import { matchExpression } from "@/components/react-easy-formrender/utils/utils";
import './style.less';
import CustomModal from "@/components/AntdModal";
import { isEmpty } from "@/utils/type";
import { ELementProps } from "../..";
import { LinkageBtn } from "../linkage";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

interface CurrentValue {
  max?: number | string;
  min?: number | string;
  pattern?: boolean | string;
  required?: boolean | string;
  message?: string
}

export interface RuleItemProps {
  name?: string;
  label?: string;
  controlLabel: string;
  controlField?: ELementProps;
  value?: CurrentValue;
  onChange?: (val?: CurrentValue) => void;
}

const prefixCls = 'rules-item-setting';
const classes = {
  item: prefixCls,
  label: `${prefixCls}-label`,
  message: `${prefixCls}-message`,
  icon: `${prefixCls}-icon`,
}

const SelectOptions = [
  { label: '手动设置', value: 'handle' },
  { label: '联动设置', value: 'linkage' }
];

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

  const [ruleValue, setRuleValue] = useState<CurrentValue>();
  const [checkboxValue, setCheckboxValue] = useState<boolean>();
  // const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);
  // const SelectOptions = [{ label: '手动设置', value: 'handle' }, { label: '联动设置', value: 'linkage' }];
  // const currentForm = useFormStore();
  // const formvalues = useFormValues<{ selectType: string }>(currentForm, ['selectType']);
  // const selectType = formvalues?.['selectType'];
  // const currentMessage = value?.['message'];
  // const ruleValue = name ? value?.[name] : undefined;
  // const [ruleValueMap, setRuleValueMap] = useState<{ [key: string]: any }>({});

  // useEffect(() => {
  //   if (name) {
  //     const matchStr = matchExpression(ruleValue);
  //     if (matchStr) {
  //       setRuleValueMap({ linkage: ruleValue });
  //       currentForm.setFieldValue({ selectType: 'linkage', [name]: ruleValue, message: currentMessage });
  //     } else {
  //       setRuleValueMap({ handle: ruleValue });
  //       currentForm.setFieldValue({ selectType: 'handle', [name]: ruleValue, message: currentMessage });
  //     }
  //   }
  // }, [value]);

  // const dataChange = (type: 'handle' | 'linkage', data: any) => {
  //   setRuleValueMap((old) => ({ ...old, [type]: data }));
  // }

  // const selectTypeChange = (key: string) => {
  //   if (key && name) {
  //     currentForm.setFieldValue({ [name]: ruleValueMap[key], });
  //   }
  // }

  // const properties = name ? {
  //   selectType: {
  //     label: '赋值方式',
  //     layout: 'horizontal',
  //     labelWidth: 80,
  //     initialValue: 'handle',
  //     type: 'Select',
  //     onFieldsChange: selectTypeChange,
  //     props: {
  //       style: { width: '100%' },
  //       options: SelectOptions
  //     }
  //   },
  //   [name]: selectType === 'linkage' ? {
  //     label: '联动条件',
  //     layout: 'horizontal',
  //     initialValue: ruleValueMap[selectType],
  //     labelWidth: 80,
  //     onFieldsChange: (data: any) => dataChange('linkage', data),
  //     typeRender: <LinkageBtn controlField={controlField} />
  //   } : {
  //     label: controlLabel,
  //     layout: 'horizontal',
  //     initialValue: selectType && ruleValueMap[selectType],
  //     onFieldsChange: (data: any) => dataChange('handle', data),
  //     labelWidth: 80,
  //     ...controlField
  //   },
  //   message: {
  //     label: '提示信息',
  //     layout: 'horizontal',
  //     initialValue: currentMessage,
  //     rules: [{ required: true, message: '请输入' }],
  //     labelWidth: 80,
  //     type: 'Input',
  //     props: {
  //     }
  //   },
  // } : undefined;

  // const confirm = async () => {
  //   const { error, values } = await currentForm.validate();
  //   if (error) return;
  //   const { selectType, ...rest } = values || {}
  //   if (name) {
  //     const result = rest;
  //     onChange && onChange(result);
  //   }
  //   closeTooltip();
  // }

  // const closeTooltip = () => {
  //   setTooltipVisible(false);
  // }

  // const renderContent = () => {
  //   return (
  //     <div className={classes.tooltipContent}>
  //       <RenderForm
  //         tagName="div"
  //         form={currentForm}
  //         properties={properties}
  //       />
  //       <div className={classes.confirm}>
  //         <Button onClick={closeTooltip}>取消</Button>
  //         <Button type="primary" onClick={confirm}>确认</Button>
  //       </div>
  //     </div>
  //   );
  // }

  // const showTooltip = () => {
  //   setTooltipVisible(!tooltipVisible);
  // }

  const editRef = useRef<any>();
  const currentForm = useFormStore();
  const { selectType } = useFormValues<{ selectType: string }>(currentForm, ['selectType']) || {};

  const properties = name ? {
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
    [name]: selectType === 'linkage' ? {
      label: '联动条件',
      layout: 'horizontal',
      labelWidth: 80,
      typeRender: <LinkageBtn controlField={controlField} />
    } : {
      label: controlLabel,
      layout: 'horizontal',
      labelWidth: 80,
      ...controlField
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
    setCheckboxValue(isEmpty(value) ? false : true);
    setRuleValue(value);
    setRuleModal(value);
  }, [value])

  const setRuleModal = (data?: CurrentValue) => {
    if (name && data?.[name] !== undefined) {
      const matchStr = matchExpression(data?.[name]);
      currentForm.setFieldsValue({ selectType: matchStr ? 'linkage' : 'handle', ...data })
    } else {
      currentForm.setFieldsValue({});
    }
  }

  const checkboxChange = (e: CheckboxChangeEvent) => {
    const checked = e?.target?.checked;
    if (name && ruleValue?.[name]) {
      if (checked) {
        setCheckboxValue(true);
        // onChange && onChange(ruleValue);
      } else {
        setCheckboxValue(false);
        // onChange && onChange({});
      }
    } else {
      if (checked) {
        editRef.current && editRef.current.click();
      } else {
        setCheckboxValue(false);
      }
    }
  }

  const handleOk = async (closeModal: () => void) => {
    const { error, values } = await currentForm.validate();
    if (error) return;
    const { selectType, ...rest } = values || {}
    setRuleValue(rest);
    // 选中状态则直接更改值
    if (checkboxValue) {
      onChange && onChange(rest);
    }
    closeModal();
  }

  const clearValue = () => {
    // 选中状态则更改值
    if (checkboxValue) {
      onChange && onChange();
    }
    setCheckboxValue(false);
    setRuleValue(undefined);
  }

  return (
    <div className={classes.item} ref={ref}>
      <CustomModal title="校验规则" onOk={handleOk} displayElement={
        (showModal) => (
          <div className={classes.label}>
            {label}
            <span ref={editRef} onClick={showModal}>
              <Icon className={classes.icon} title="编辑" name="edit" />
            </span>
            {name && ruleValue?.[name] && <Icon className={classes.icon} onClick={clearValue} title="清除" name="qingchu" />}
          </div>
        )
      }>
        <RenderForm
          tagName="div"
          form={currentForm}
          properties={properties}
        />
      </CustomModal>
      <Checkbox checked={checkboxValue} onChange={checkboxChange} {...rest} />
    </div>
  );
});

export default RuleItem;
