import React, { cloneElement, isValidElement, useCallback, useContext, useState, CSSProperties, useEffect } from 'react'
import { StoreContext } from '../design-context';
import classnames from 'classnames';

export interface DesignComponentsProps {
  className?: string
  style?: CSSProperties
}
const prefixCls = 'easy-form-design-components';
function DesignComponents(props: DesignComponentsProps, ref: any) {
  const store = useContext(StoreContext)
  const {
    style,
    className
  } = props;

  const cls = classnames(prefixCls, className)

  return (
    <div ref={ref} className={cls} style={style}>
11111
    </div>
  );
};

DesignComponents.displayName = 'design-components';
export default React.forwardRef(DesignComponents);
