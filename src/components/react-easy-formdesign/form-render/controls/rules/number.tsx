import { isEmpty } from "@/utils/type";
import { Button, Col, Input, message, Row } from "antd";
import React, { ChangeEvent, LegacyRef, useEffect, useState } from "react";
import './number.less';
import Icon from "@/components/svg-icon";

export interface NumberComponentProps {
  value?: number | string;
  onChange?: (val: number | string) => void;
}

const prefixCls = 'number-item';
const classes = {
  item: prefixCls
}

const NumberComponent: React.FC<NumberComponentProps> = React.forwardRef((props, ref: LegacyRef<HTMLElement>) => {

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

export default NumberComponent;
