import React, { LegacyRef, useEffect, useMemo, useState } from "react";
import './index.less';
import RequiredComponent from "./required";
import MinOrMaxComponent from "./minOrMax";
import PatternComponent from "./pattern";
import RenderForm, { FormFieldProps, RenderFormProps, useFormStore } from '../../../form-render';

/**
 * 校验规则的配置组件。
 */

export interface RulesComponentProps {
  includes?: string;
  value?: FormFieldProps['rules'];
  onChange?: (val?: FormFieldProps['rules']) => void;
}

const prefixCls = 'rules-add'
const classes = {
  rules: prefixCls,
  item: `${prefixCls}-item`,
  checkbox: `${prefixCls}-checkbox`
}

const RulesComponent: React.FC<RulesComponentProps> = React.forwardRef((props, ref: LegacyRef<HTMLElement>) => {

  const {
    includes = ['required', 'pattern', 'max', 'min'],
    value,
    onChange,
    ...rest
  } = props;

  const [rulesData, setRulesData] = useState<RulesComponentProps['value']>([]);

  useEffect(() => {
    setRulesData(value);
  }, [value])

  const rulesList = useMemo(() => ([
    { name: 'required', label: '必填', component: RequiredComponent },
    { name: 'pattern', label: '正则表达式', component: PatternComponent },
    { name: 'max', label: '上限', component: MinOrMaxComponent },
    { name: 'min', label: '下限', component: MinOrMaxComponent },
  ]?.filter((item) => includes?.includes(item?.name))), [includes]);

  const currentForm = useFormStore();
  const properties = useMemo(() => (
    rulesList?.map((item, index) => {
      const { component: Child, label, name } = item
      return {
        compact: true,
        typeRender: <Child label={label} name={name} />
      }
    })
  ), [rulesList]);

  const onFieldsChange: RenderFormProps['onFieldsChange'] = (_, values) => {
    setRulesData(values);
    onChange && onChange(values);
  }

  return (
    <div className={classes.rules}>
      <RenderForm
        tagName="div"
        initialValues={rulesData}
        form={currentForm}
        properties={properties}
        onFieldsChange={onFieldsChange}
      />
    </div>
  );
});

export default RulesComponent;
