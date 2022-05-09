import React, { cloneElement, useCallback, useContext, useState, CSSProperties, useEffect } from 'react'
import { StoreContext } from '../design-context';
import classnames from 'classnames';

export interface DesignPropertiesProps {
  className?: string
  style?: CSSProperties
}
const prefixCls = 'easy-form-design-properties';
function DesignProperties(props: DesignPropertiesProps, ref: any) {
  const store = useContext(StoreContext);
  const {
    style,
    className
  } = props;

  const cls = classnames(prefixCls, className)

  return (
    <div ref={ref} className={cls} style={style}>
3333
    </div>
  )
};

DesignProperties.displayName = 'design-properties';
export default React.forwardRef(DesignProperties);
