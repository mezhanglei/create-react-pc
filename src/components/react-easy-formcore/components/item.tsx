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
  compact?: boolean;
  className?: string;
  children?: React.ReactNode;
  style?: CSSProperties;
}

const prefixCls = 'field-item';
const classes = {
  field: prefixCls,
  inline: `${prefixCls}--inline`,
  required: `${prefixCls}--required`,
  compact: `${prefixCls}--compact`,
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
    compact,
    className,
    style,
    children,
    ...rest
  } = itemProps

  const isRequired = error ? true : required;

  const cls = classnames(
    classes.field,
    layout ? `${classes.field}--${layout}` : '',
    isRequired ? classes.required : '',
    compact ? classes.compact : '',
    error ? classes.error : '',
    inline ? classes.inline : '',
    className ? className : ''
  );

  return (
    <div ref={ref} className={cls} style={style} {...rest}>
      <Label colon={colon} gutter={gutter} labelWidth={labelWidth} labelAlign={labelAlign} required={isRequired} style={labelStyle}>
        {label}
      </Label>
      <Control error={error} footer={footer} suffix={suffix}>
        {children}
      </Control>
    </div>
  );
});
