import React from "react";
import RuleItem, { RuleItemProps } from "./rule-item";

const MinOrMaxComponent = React.forwardRef<HTMLDivElement, RuleItemProps>((props, ref) => {

  return <RuleItem {...props} ref={ref} ruleField={{ label: '数值', type: 'InputNumber', props: {} }} />
});

export default MinOrMaxComponent;
