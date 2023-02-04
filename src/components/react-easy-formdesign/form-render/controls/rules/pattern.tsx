import { isEmpty } from "@/utils/type";
import { Button, Col, Input, message, Row } from "antd";
import React, { ChangeEvent, LegacyRef, useEffect, useState } from "react";
import './pattern.less';
import Icon from "@/components/svg-icon";

export interface PatternComponentProps {
  value?: string;
  onChange?: (val: string) => void;
}

const prefixCls = 'pattern-item';
const classes = {
  item: prefixCls
}

const PatternComponent: React.FC<PatternComponentProps> = React.forwardRef((props, ref: LegacyRef<HTMLElement>) => {

  const {
    value,
    onChange,
    ...rest
  } = props;

  return (
    <div>
      
    </div>
  );
});

export default PatternComponent;
