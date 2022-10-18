import classnames from 'classnames';
import React, { CSSProperties } from 'react';
import './label.less';

export interface LabelBaseProps {
  colon?: boolean;
  required?: boolean;
  labelWidth?: number;
  labelAlign?: CSSProperties['textAlign'];
  labelStyle?: CSSProperties;
  gutter?: number;
}
export interface LabelProps extends LabelBaseProps {
  children: any;
  style?: CSSProperties;
  className?: string;
}

export const Label = React.forwardRef((props: LabelProps, ref: any) => {
  const {
    children,
    style,
    className,
    colon,
    required,
    gutter,
    labelWidth,
    labelAlign,
    ...restProps
  } = props;

  const prefix = 'item-label';

  const cls = classnames(
    `${prefix}__header`,
    required ? `${prefix}--required` : '',
    className ? className : ''
  );

  const mergeStyle = {
    marginRight: gutter,
    width: labelWidth,
    textAlign: labelAlign,
    ...style
  }

  return (
    children !== undefined ? (
      <label ref={ref} className={cls} style={mergeStyle} {...restProps}>
        {colon ? <>{children}:</> : children}
      </label>
    ) : null
  );
});
