import React from "react";
import './style.less';
import RuleItem, { RuleItemProps } from "./rule-item";

const MinOrMaxComponent = React.forwardRef<HTMLDivElement, Omit<RuleItemProps, 'controlLabel' | 'controlField'>>((props, ref) => {

  return <RuleItem {...props} ref={ref} controlLabel="数值" controlField={{ type: 'InputNumber', props: {} }} />
});

export default MinOrMaxComponent;
