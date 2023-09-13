import React from "react";
import RuleItem, { RuleItemProps } from "./rule-item";

const RequiredComponent = React.forwardRef<HTMLDivElement, RuleItemProps>((props, ref) => {

  return <RuleItem {...props} ref={ref} ruleField={{ label: '启用', valueProp: 'checked', type: 'Switch', props: {} }} />
});

export default RequiredComponent;
