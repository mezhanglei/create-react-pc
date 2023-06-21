import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import { Control, ControlBaseProps } from './control';
import { Label, LabelBaseProps } from './label';
import './item.less';
import pickAttrs from '@/utils/pickAttrs';

export type Layout = 'horizontal' | 'vertical' | string;
export interface ItemProps extends LabelBaseProps, ControlBaseProps {
  label?: string;
  inline?: boolean;
  layout?: Layout;
  compact?: boolean;
  readOnly?: boolean;
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
  error: `${prefixCls}--error`,
  readOnly: `${prefixCls}--readOnly`,
};

export const Item = React.forwardRef<any, ItemProps>((props, ref) => {
  const {
    /** LabelBaseProps */
    colon,
    required,
    showLabel,
    labelWidth,
    labelAlign,
    gutter,
    tooltip,
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
    readOnly,
    className,
    style,
    children,
    ...rest
  } = itemProps

  const cls = classnames(
    classes.field,
    layout ? `${classes.field}--${layout}` : '',
    required === true ? classes.required : '',
    compact === true ? classes.compact : '',
    error ? classes.error : '',
    inline === true ? classes.inline : '',
    readOnly === true ? classes.readOnly : '',
    className ? className : ''
  );

  return (
    <div ref={ref} className={cls} style={style} {...pickAttrs(rest)}>
      <Label
        showLabel={showLabel}
        tooltip={tooltip}
        colon={colon}
        gutter={gutter}
        labelWidth={labelWidth}
        labelAlign={labelAlign}
        required={required}
        style={labelStyle}>
        {label}
      </Label>
      <Control error={error} footer={footer} suffix={suffix}>
        {children}
      </Control>
    </div>
  );
});
