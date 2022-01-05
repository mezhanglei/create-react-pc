import React, { cloneElement, isValidElement, useCallback, useContext, useState, CSSProperties, useEffect } from 'react'
import { DesignStoreContext } from '../design-store-context';
import classnames from 'classnames';

export interface DesignComponentsProps {
  className?: string
  style?: CSSProperties
}
const prefixCls = 'easy-form-design-components';
export const DesignComponents = React.forwardRef((props: DesignComponentsProps, ref: any) => {
  const store = useContext(DesignStoreContext)
  const {
    style,
    className
  } = props;

  const cls = classnames(prefixCls, className)

  return (
    <div ref={ref} className={cls} style={style}>

    </div>
  );
});

DesignComponents.displayName = 'design-components';
