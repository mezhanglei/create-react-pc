import React from 'react';
import { Col, ColProps, Row, RowProps } from "antd";
import { GeneratePrams } from '../types';
import './grid.less';
import classnames from 'classnames';

// 列宽
export const getColProps = (props: ColProps, inline?: boolean) => {
  const { xs, sm, md, lg, span, ...restProps } = props || {};
  const maxspan = 24;
  // 计算layout带来的影响
  const getValue = (inline?: boolean, value?: any) => {
    if (!inline) {
      return value ?? (span || maxspan);
    }
  }
  return {
    xs: getValue(inline, xs),
    sm: getValue(inline, sm),
    md: getValue(inline, md),
    lg: getValue(inline, lg),
    ...restProps
  }
}

export interface GridRowProps extends RowProps, GeneratePrams {
  children: any;
}
// row组件
export const GridRow = React.forwardRef<any, GridRowProps>((props, ref) => {
  const {
    name,
    path,
    field,
    parent,
    formrender,
    form,
    children,
    className,
    ...rest
  } = props;
  const cls = classnames('grid-row', className);
  return (
    <Row ref={ref} className={cls} {...rest}>
      {children}
    </Row>
  );
});

export interface GridColProps extends ColProps, GeneratePrams {
  children: any;
}
// col组件
export const GridCol = React.forwardRef<any, GridColProps>((props, ref) => {
  const {
    name,
    path,
    field,
    parent,
    formrender,
    form,
    className,
    children,
    ...rest
  } = props;
  const calcProps = getColProps(rest, field?.inline);
  const cls = classnames('grid-col', className);
  return (
    <Col ref={ref} className={cls} {...calcProps}>
      {children}
    </Col>
  );
});
