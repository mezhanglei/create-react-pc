import { Checkbox } from "antd";
import React, { LegacyRef, useEffect, useMemo, useState } from "react";
import './index.less';
import RequiredComponent from "./required";
import NumberComponent from "./number";
import PatternComponent from "./number";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { CheckboxValueType } from "antd/lib/checkbox/Group";

/**
 * 校验规则的配置组件。
 */

export interface RulesComponentProps {
  includes?: string;
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
    ...rest
  } = props;

  const [rulesData, setRulesData] = useState([]);

  const rulesList = useMemo(() => ([
    { name: 'required', label: '必填', component: RequiredComponent },
    { name: 'pattern', label: '正则表达式', component: PatternComponent },
    { name: 'max', label: '上限', component: NumberComponent },
    { name: 'min', label: '下限', component: NumberComponent },
  ]?.filter((item) => includes?.includes(item?.name))), [includes]);

  const handleChange = (val) => {

  }

  return (
    <div className={classes.rules}>
      {
        rulesList?.map((item, index) => {
          const { component: Child, label, name } = item
          return (
            <div key={index} className={classes.item}>
              <Child label={label} name={name} onChange={handleChange} />
            </div>
          )
        })
      }
    </div>
  );
});

export default RulesComponent;
