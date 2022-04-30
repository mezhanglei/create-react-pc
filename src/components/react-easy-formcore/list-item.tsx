import React, { CSSProperties } from 'react'
import classnames from 'classnames';
import './list-item.less';
import { LayoutEnum } from './form-options-context';

export interface ListItemProps {
  label?: any;
  layout?: LayoutEnum;
  labelStyle?: CSSProperties;
  suffix?: React.ReactNode;
  required?: boolean;
  gutter?: number;
  className?: string;
  children?: React.ReactNode;
  style?: CSSProperties;
}

const prefixCls = 'custom-list-item';
export const classes_item = {
  field: prefixCls,
  required: `${prefixCls}--required`,

  header: `${prefixCls}__header`,
  container: `${prefixCls}__container`,
  footer: `${prefixCls}__footer`
}

export const ListItem = React.forwardRef((props: ListItemProps, ref: any) => {
  const {
    label,
    suffix,
    required,
    labelStyle,
    layout = 'horizontal',
    gutter,
    className,
    children,
    style,
  } = props

  const cls = classnames(
    classes_item.field,
    required ? classes_item.required : '',
    className ? className : '',
    `${classes_item.field}--${layout}`
  )

  const headerStyle = {
    marginRight: gutter,
    ...labelStyle
  }

  return (
    <div ref={ref} className={cls} style={style}>
      {label !== undefined && (
        <div className={classes_item.header} style={headerStyle}>
          {label}
        </div>
      )}
      <div className={classes_item.container}>
        {children}
      </div>
      {suffix !== undefined && <div className={classes_item.footer}>{suffix}</div>}
    </div>
  );
});

ListItem.displayName = 'ListItem';
