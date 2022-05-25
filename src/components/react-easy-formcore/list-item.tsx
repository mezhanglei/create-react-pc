import React, { CSSProperties, useContext } from 'react'
import classnames from 'classnames';
import './list-item.less';
import { FormOptions, FormOptionsContext } from './form-options-context';
import { Col } from 'react-flexbox-grid';
import { getColProps } from './utils/utils';

export interface ListItemProps extends FormOptions {
  label?: any;
  suffix?: React.ReactNode;
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
  const options = useContext(FormOptionsContext)
  const finalProps = { ...options, ...props };
  const { children, ...fieldProps } = finalProps;
  const {
    label,
    suffix,
    required,
    labelStyle,
    layout = "horizontal",
    col,
    colon,
    gutter,
    className,
    style,
    ...restProps
  } = fieldProps;

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

  const colProps = getColProps({ layout: layout, col });

  return (
    <Col ref={ref} className={cls} style={style} {...colProps} {...restProps}>
      {label !== undefined && (
        <div className={classes_item.header} style={headerStyle}>
          {colon ? <>{label}:</> : label}
        </div>
      )}
      <div className={classes_item.container}>
        {children}
      </div>
      {suffix !== undefined && <div className={classes_item.footer}>{suffix}</div>}
    </Col>
  );
});

ListItem.displayName = 'List.Item';
