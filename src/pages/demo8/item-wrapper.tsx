import classnames from 'classnames';
import React, { CSSProperties } from 'react';
import './item-wrapper.less';

export interface WrapperProps {
  children: any;
  style?: CSSProperties;
  className?: string;
  error?: string;
}

function ItemWrapper(props: WrapperProps, ref: any) {
  const {
    children,
    style,
    className,
    error,
    ...restProps
  } = props;

  const prefix = 'table-cell';

  const cls = classnames(
    `${prefix}__wrapper`,
    error ? `${prefix}-error` : '',
    className ? className : ''
  );

  return (
    <div ref={ref} className={cls} style={style} {...restProps}>
      <div className={`${prefix}__control`}>
        {children}
      </div>
      <div className={`${prefix}__message`}>{error}</div>
    </div>
  );
};

export default React.forwardRef(ItemWrapper);