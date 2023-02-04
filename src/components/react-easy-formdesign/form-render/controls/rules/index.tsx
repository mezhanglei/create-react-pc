import { Checkbox } from "antd";
import React, { LegacyRef, useEffect, useMemo, useState } from "react";
import './index.less';
import RequiredComponent from "./required";
import NumberComponent from "./number";
import PatternComponent from "./number";

/**
 * 校验规则的配置组件。
 */

export interface RulesComponentProps {
  includes?: string;
}

const prefixCls = 'rules-add'
const classes = {
  rules: prefixCls
}

const RulesComponent: React.FC<RulesComponentProps> = React.forwardRef((props, ref: LegacyRef<HTMLElement>) => {

  const {
    includes = ['required', 'pattern', 'max', 'min'],
    ...rest
  } = props;

  const rulesList = useMemo(() => ([
    { value: 'required', label: '必填', component: RequiredComponent },
    { value: 'pattern', label: '正则表达式', component: PatternComponent },
    { value: 'max', label: '上限', component: NumberComponent },
    { value: 'min', label: '下限', component: NumberComponent },
  ]?.filter((item) => includes?.includes(item?.value))), [includes])

  return (
    <div className={classes.rules}>
      <Checkbox.Group>
        {rulesList?.map((item) => {
          const Child = item?.component;
        })}
      </Checkbox.Group>
    </div>
  );
});

export default RulesComponent;
