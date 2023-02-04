import { isEmpty } from "@/utils/type";
import { Button, Col, Input, message, Row } from "antd";
import React, { ChangeEvent, LegacyRef, useEffect, useState } from "react";
import './required.less';
import Icon from "@/components/svg-icon";

export interface RequiredComponentProps {
  value?: boolean | string;
  onChange?: (val: boolean | string) => void;
}

const prefixCls = 'required-item';
const classes = {
  item: prefixCls
}

const RequiredComponent: React.FC<RequiredComponentProps> = React.forwardRef((props, ref: LegacyRef<HTMLElement>) => {

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

export default RequiredComponent;
