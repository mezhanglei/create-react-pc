import React, { useRef, useState } from "react";
import './index.less';
import RequiredComponent from "./required";
import MinOrMaxComponent from "./minOrMax";
import PatternComponent from "./pattern";
import { getArrMap } from "@/utils/array";
import { Checkbox } from "antd";
import { InputFormRule } from "./rule-item";
import { pickObject } from "@/utils/object";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

/**
 * 校验规则的配置组件。
 */
export interface RulesComponentProps {
  includes?: Array<keyof InputFormRule>;
  value?: Array<InputFormRule>;
  onChange?: (val?: Array<InputFormRule>) => void;
}

const prefixCls = 'rules-add'
const classes = {
  rules: prefixCls,
  item: `${prefixCls}-item`,
  rule: `${prefixCls}-rule`,
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

  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const [rulesMap, setRulesMap] = useState<{ [key in keyof InputFormRule]: InputFormRule }>({});
  const ruleModalRefs = useRef<any>([]);

  const tranformToRules = (checkedValues: string[]) => {
    const result = pickObject(rulesMap, checkedValues);
    const rules = Object.values(result || {});
    return rules;
  }

  const handleCheckbox = (e: CheckboxChangeEvent, name: string, index: number) => {
    const checked = e?.target?.checked;
    const cloneCheckValues = [...checkedValues];
    // 选中
    if (checked) {
      if (rulesMap[name]) {
        cloneCheckValues.push(name);
        setCheckedValues(cloneCheckValues);
        const rules = tranformToRules(cloneCheckValues);
        onChange && onChange(rules);
      } else {
        // 没有值则先弹窗编辑
        if (ruleModalRefs.current[index]) {
          ruleModalRefs.current[index].showRuleModal();
        }
      }
    } else {
      // 取消
      const filterValues = cloneCheckValues.filter((str) => str !== name);
      setCheckedValues(filterValues);
      const rules = tranformToRules(filterValues);
      onChange && onChange(rules);
    }
  }

  const ruleChange = (name: keyof InputFormRule, val?: InputFormRule) => {
    const cloneRulesMap = { ...rulesMap };
    if (val == undefined) {
      delete cloneRulesMap[name]
      const newCheckboxValue = checkedValues.filter((str) => str !== name);
      setCheckedValues(newCheckboxValue);
    } else {
      cloneRulesMap[name] = val;
    }
    setRulesMap(cloneRulesMap);
    // 如果有选中则更新
    if (checkedValues.includes(name)) {
      const result = Object.values(cloneRulesMap);
      onChange && onChange(result)
    }
  }

  return (
    <div className={classes.rules}>
      <Checkbox.Group value={checkedValues}>
        {
          includes.map((name, index) => {
            const itemProps = RuleComponentsMap[name];
            const { label, component: Child } = itemProps || {};
            return (
              <div key={name} className={classes.item}>
                <Child ref={(target) => ruleModalRefs.current[index] = target} className={classes.rule} ruleName={label} name={name} value={rulesMap[name]} onChange={(val) => ruleChange(name, val)} />
                <Checkbox value={name} onChange={(e) => handleCheckbox(e, name, index)}>
                </Checkbox>
              </div>
            )
          })
        }
      </Checkbox.Group>
    </div>
  );
});

export default RulesComponent;
