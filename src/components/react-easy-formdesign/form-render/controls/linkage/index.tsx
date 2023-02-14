import React, { LegacyRef, useEffect, useMemo, useState } from "react";
import './index.less';

/**
 * 联动设置组件，设置联动条件
 */

export interface LinkageComponentProps {
  value?: string;
  onChange?: (val?: string) => void;
}

const prefixCls = 'linkage-setting'
const classes = {
  linkage: prefixCls,
}

const LinkageComponent: React.FC<LinkageComponentProps> = React.forwardRef((props, ref: LegacyRef<HTMLDivElement>) => {

  const {
    value,
    onChange,
    ...rest
  } = props;

  return (
    <div className={classes.linkage} ref={ref}>
    </div>
  );
});

export default LinkageComponent;
