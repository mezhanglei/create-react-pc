import React, { CSSProperties } from 'react'
import classnames from 'classnames';
import './list-item.less';
import { LabelAlignEnum } from './form-options-context';
import { Col } from 'react-flexbox-grid';
import { getColProps } from './utils/utils';
import { ColProps } from './form-options-context';

export interface ListItemProps {
  label?: any;
  labelAlign?: LabelAlignEnum;
  col?: ColProps;
  colon?: boolean;
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
    labelAlign = LabelAlignEnum.Horizontal,
    col,
    colon,
    gutter,
    className,
    children,
    style,
  } = props

  const cls = classnames(
    classes_item.field,
    required ? classes_item.required : '',
    className ? className : '',
    `${classes_item.field}--${labelAlign}`
  )

  const headerStyle = {
    marginRight: gutter,
    ...labelStyle
  }

  const colProps = getColProps({ labelAlign: labelAlign, col });

  return (
    <Col ref={ref} className={cls} style={{ padding: 0, ...style }} {...colProps}>
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

ListItem.displayName = 'ListItem';
