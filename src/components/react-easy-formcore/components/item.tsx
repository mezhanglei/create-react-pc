import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import { Control, ControlBaseProps } from './control';
import { Label, LabelBaseProps } from './label';
import './item.less';

export type Layout = 'horizontal' | 'vertical' | string;
export interface ItemProps extends LabelBaseProps, ControlBaseProps {
  label?: string;
  inline?: boolean;
  layout?: Layout;
  className?: string;
  children?: React.ReactNode;
  style?: CSSProperties;
}

const prefixCls = 'field-item';
const classes = {
  field: prefixCls,
  inline: `${prefixCls}--inline`,
  compact: `${prefixCls}--compact`,
  required: `${prefixCls}--required`,
  error: `${prefixCls}--error`
};

export const Item = React.forwardRef((props: ItemProps, ref: any) => {
  const {
    /** LabelBaseProps */
    colon,
    required,
    labelWidth,
    labelAlign,
    gutter,
    /** ControlBaseProps */
    compact,
    error,
    suffix,
    footer,
    ...itemProps
  } = props;

  const {
    label,
    labelStyle,
    inline,
    layout = "horizontal",
    className,
    style,
    children,
    ...rest
  } = itemProps

  const cls = classnames(
    classes.field,
    layout ? `${classes.field}--${layout}` : '',
    compact ? classes.compact : '',
    required ? classes.required : '',
    error ? classes.error : '',
    inline ? classes.inline : '',
    className ? className : ''
  );

  return (
    <div ref={ref} className={cls} style={style} {...rest}>
      <Label colon={colon} gutter={gutter} labelWidth={labelWidth} labelAlign={labelAlign} required={required} style={labelStyle}>
        {label}
      </Label>
      <Control compact={compact} error={error} footer={footer} suffix={suffix}>
        {children}
      </Control>
    </div>
  );
});
