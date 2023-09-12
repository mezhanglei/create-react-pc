import React, { useEffect, useMemo } from "react";
import './index.less';
import RequiredComponent from "./required";
import MinOrMaxComponent from "./minOrMax";
import PatternComponent from "./pattern";
import RenderForm, { GenerateFormNodeProps, RenderFormProps, useFormStore } from '../../../';
import { getArrMap } from "@/utils/array";

/**
 * 校验规则的配置组件。
 */
export interface RulesComponentProps {
  includes?: string[];
  value?: GenerateFormNodeProps['rules'];
  onChange?: (val?: GenerateFormNodeProps['rules']) => void;
}

const prefixCls = 'rules-add'
const classes = {
  rules: prefixCls,
  item: `${prefixCls}-item`,
  checkbox: `${prefixCls}-checkbox`
}

// 校验规则组件集合
const RuleComponents = [
  { name: 'required', label: '必填', component: RequiredComponent },
  { name: 'pattern', label: '正则表达式', component: PatternComponent },
  { name: 'max', label: '上限', component: MinOrMaxComponent },
  { name: 'min', label: '下限', component: MinOrMaxComponent },
]
const RuleComponentsMap = getArrMap(RuleComponents, 'name');

const RulesComponent = React.forwardRef<HTMLElement, RulesComponentProps>((props, ref) => {

  const {
    includes = ['required', 'pattern', 'max', 'min'],
    value,
    onChange,
    ...rest
  } = props;

  const form = useFormStore();

  // useEffect(() => {
  //   form.setFieldsValue(value);
  // }, [value]);

  const properties = useMemo(() => (
    includes.map((name) => {
      const itemProps = RuleComponentsMap[name];
      const { label, component: Child } = itemProps || {};
      return {
        compact: true,
        typeRender: <Child label={label} name={name} />
      }
    })
  ), [includes])

  const onFieldsChange: RenderFormProps['onFieldsChange'] = (_, values) => {
    // onChange && onChange(values);
  }

  return (
    <div className={classes.rules}>
      <RenderForm
        tagName="div"
        form={form}
        properties={properties}
        onFieldsChange={onFieldsChange}
      />
    </div>
  );
});

export default RulesComponent;
