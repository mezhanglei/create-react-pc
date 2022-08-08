import React, { CSSProperties, useContext } from 'react';
import classnames from 'classnames';
import './list-item.less';
import { FormOptions, FormOptionsContext } from './form-options-context';
import { Control } from './control';
import { Label } from './label';

export interface ListItemProps extends FormOptions {
  label?: any;
  name?: string;
  path?: string;
  suffix?: React.ReactNode | any; // 右边节点
  footer?: React.ReactNode | any; // 底部节点
  className?: string;
  children?: React.ReactNode;
  style?: CSSProperties;
  index?: number;
}

const prefixCls = 'custom-item';
const classes = {
  field: prefixCls,
  inline: `${prefixCls}--inline`,
  compact: `${prefixCls}--compact`,
  required: `${prefixCls}--required`
}

export const ListItem = React.forwardRef((props: ListItemProps, ref: any) => {
  const options = useContext(FormOptionsContext)
  const mergeProps = { ...options, ...props };
  const { children, ...fieldProps } = mergeProps;
  const {
    label,
    suffix,
    footer,
    required,
    labelWidth,
    labelAlign,
    labelStyle,
    layout = "horizontal",
    inline,
    compact,
    colon,
    gutter,
    className,
    style,
    name,
    path,
    ...restProps
  } = fieldProps;

  const cls = classnames(
    classes.field,
    layout ? `${classes.field}--${layout}` : '',
    compact ? classes.compact : '',
    required ? classes.required : '',
    inline ? classes.inline : '',
    className ? className : ''
  );

  const headerStyle = {
    marginRight: gutter,
    width: labelWidth,
    textAlign: labelAlign,
    ...labelStyle
  }

  return (
    <div ref={ref} className={cls} style={style}>
      <Label colon={colon} required={required} style={headerStyle}>
        {label}
      </Label>
      <Control compact={compact} footer={footer} suffix={suffix}>
        {children}
      </Control>
    </div>
  );
});

ListItem.displayName = 'List.Item';
