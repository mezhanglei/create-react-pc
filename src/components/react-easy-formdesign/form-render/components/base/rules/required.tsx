import React from "react";
import RuleItem, { RuleItemProps, RuleItemRefs } from "./rule-item";

const RequiredComponent = React.forwardRef<RuleItemRefs, RuleItemProps>((props, ref) => {

  return <RuleItem {...props} ref={ref} ruleField={{ label: '启用', valueProp: 'checked', type: 'Switch', props: {} }} />
});

export default RequiredComponent;
