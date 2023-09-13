import React from "react";
import RuleItem, { RuleItemProps } from "./rule-item";

const PatternComponent = React.forwardRef<HTMLDivElement, RuleItemProps>((props, ref) => {

  return <RuleItem {...props} ref={ref} ruleField={{ label: '正则表达式', type: 'CodeTextArea', props: {} }} />
});

export default PatternComponent;
