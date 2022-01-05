import React, { cloneElement, isValidElement, useCallback, useContext, useState, CSSProperties, useEffect } from 'react'
import { DesignStoreContext } from '../design-store-context';
import classnames from 'classnames';

export interface DesignPropertiesProps {
  className?: string
  style?: CSSProperties
}
const prefixCls = 'easy-form-design-properties';
export const DesignProperties = React.forwardRef((props: DesignPropertiesProps, ref: any) => {
  const store = useContext(DesignStoreContext)
  const {
    style,
    className
  } = props;

  const cls = classnames(prefixCls, className)

  return (
    <div ref={ref} className={cls} style={style}>

    </div>
  )
})

DesignProperties.displayName = 'design-properties';
