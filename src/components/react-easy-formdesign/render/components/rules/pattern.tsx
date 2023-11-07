import React from "react";
import RuleItem, { RuleItemProps, RuleItemRefs } from "./rule-item";

const PatternComponent = React.forwardRef<RuleItemRefs, RuleItemProps>((props, ref) => {

  return <RuleItem {...props} ref={ref} ruleField={{
    label: '正则表达式',
    type: 'CodeTextArea',
    props: {
      placeholder: '请输入正则表达式'
    }
  }} />
});

export default PatternComponent;
