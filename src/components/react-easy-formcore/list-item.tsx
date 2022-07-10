import React, { CSSProperties, useContext } from 'react';
import classnames from 'classnames';
import './list-item.less';
import { FormOptions, FormOptionsContext } from './form-options-context';
import { Col, Row } from 'react-flexbox-grid';
import { getColProps } from './utils/utils';

export interface ListItemProps extends FormOptions {
  label?: any;
  suffix?: React.ReactNode | any; // 右边节点
  footer?: React.ReactNode | any; // 底部节点
  className?: string;
  children?: React.ReactNode;
  style?: CSSProperties;
  customInner?: any;
  index?: number;
}

const prefixCls = 'custom-list-item';
export const classes_item = {
  field: prefixCls,
  inner: 'field-inner',
  inline: `${prefixCls}--inline`,
  compact: `${prefixCls}--compact`,
  required: `${prefixCls}--required`,

  header: `${prefixCls}__header`,
  container: `${prefixCls}__container`,
  control: `${prefixCls}__control`,
  suffix: `${prefixCls}__suffix`,
  footer: `${prefixCls}__footer`
}

export const ListItem = React.forwardRef((props: ListItemProps, ref: any) => {
  const options = useContext(FormOptionsContext)
  const finalProps = { ...options, ...props };
  const { children, ...fieldProps } = finalProps;
  const {
    label,
    suffix,
    footer,
    required,
    labelWidth,
    labelAlign,
    labelStyle,
    layout = "horizontal",
    customInner,
    inline,
    compact,
    col,
    colon,
    gutter,
    className,
    style,
    ...restProps
  } = fieldProps;

  const cls = classnames(
    classes_item.field,
    compact ? classes_item.compact : '',
    required ? classes_item.required : '',
    inline ? classes_item.inline : '',
    className ? className : ''
  )

  const innerCls = classnames(classes_item.inner, `${classes_item.inner}--${layout}`);

  const headerStyle = {
    marginRight: gutter,
    width: labelWidth,
    textAlign: labelAlign,
    ...labelStyle
  }

  const colProps = getColProps({ inline: inline, col });

  const InnerContent = (
    <>
      {label !== undefined && (
        <div className={classes_item.header} style={headerStyle}>
          {colon ? <>{label}:</> : label}
        </div>
      )}
      <div className={classes_item.container}>
        <Row className={classes_item.control}>
          {children}
          {footer !== undefined && <div className={classes_item.footer}>{footer}</div>}
        </Row>
        {suffix !== undefined && <div className={classes_item.suffix}>{suffix}</div>}
      </div>
    </>
  )

  const Inner = customInner || 'div';
  const innerProps = { field: fieldProps };
  return (
    <Col ref={ref} className={cls} style={style} {...colProps} {...restProps}>
      <Inner className={innerCls} {...(customInner ? innerProps : {})}>
        {InnerContent}
      </Inner>
    </Col>
  );
});

ListItem.displayName = 'List.Item';
