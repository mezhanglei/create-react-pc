import React, { cloneElement, useCallback, useContext, useState, CSSProperties, useEffect } from 'react'
import { StoreContext } from '../design-context';
import classnames from 'classnames';

export interface DesignViewerProps {
  className?: string
  style?: CSSProperties
}
const prefixCls = 'easy-form-design-viewer';

function DesignViewer(props: DesignViewerProps, ref: any) {
  const store = useContext(StoreContext);

  const {
    style,
    className
  } = props;

  const cls = classnames(prefixCls, className)

  return (
    <div ref={ref} className={cls} style={style}>
      2222
    </div>
  );
};

DesignViewer.displayName = 'design-viewer';
export default React.forwardRef(DesignViewer);
