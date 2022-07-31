import classnames from 'classnames';
import React, { CSSProperties } from 'react';
import './label.less';

export interface LabelProps {
  children: any;
  style?: CSSProperties;
  className?: string;
  colon?: boolean;
  required?: boolean;
}

export const Label = React.forwardRef((props: LabelProps, ref: any) => {
  const {
    children,
    style,
    className,
    colon,
    required,
    ...restProps
  } = props;

  const prefix = 'item-label';

  const cls = classnames(
    `${prefix}__header`,
    required ? `${prefix}--required` : '',
    className ? className : ''
  );

  return (
    children !== undefined ? (
      <div ref={ref} className={cls} style={style} {...restProps}>
        {colon ? <>{children}:</> : children}
      </div>
    ) : null
  );
});
