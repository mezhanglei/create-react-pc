import React from "react";
import './style.less';
import RuleItem, { RuleItemProps } from "./rule-item";

const PatternComponent = React.forwardRef<HTMLDivElement, Omit<RuleItemProps, 'controlLabel' | 'controlField'>>((props, ref) => {

  return <RuleItem {...props} ref={ref} controlLabel="正则表达式" controlField={{ type: 'CodeTextArea', props: {} }} />
});

export default PatternComponent;
