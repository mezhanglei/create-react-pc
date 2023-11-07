import React from "react";
import RuleItem, { RuleItemProps, RuleItemRefs } from "./rule-item";

const MinOrMaxComponent = React.forwardRef<RuleItemRefs, RuleItemProps>((props, ref) => {

  return <RuleItem {...props} ref={ref} ruleField={{
    label: '数值',
    type: 'InputNumber',
    props: {
      placeholder: '请输入'
    }
  }} />
});

export default MinOrMaxComponent;
