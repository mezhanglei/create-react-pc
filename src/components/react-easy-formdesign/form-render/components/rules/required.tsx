import React from "react";
import './style.less';
import RuleItem, { RuleItemProps } from "./rule-item";

const RequiredComponent = React.forwardRef<HTMLDivElement, Omit<RuleItemProps, 'controlLabel' | 'controlField'>>((props, ref) => {

  return <RuleItem {...props} ref={ref} controlLabel="启用" controlField={{ valueProp: 'checked', type: 'Switch', props: {} }} />
});

export default RequiredComponent;
