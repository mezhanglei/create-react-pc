import React from 'react';
import { Col, ColProps, Row, RowProps } from "react-flexbox-grid";
import { GeneratePrams } from '../types';
import './grid.less';
import classnames from 'classnames';

export interface FromColProps extends ColProps {
  span?: number; // 所有屏幕显示列宽格数
  xs?: number; // 屏幕 < 576px 响应式栅格
  sm?: number; // 屏幕 ≥ 576px 响应式栅格
  md?: number; // 屏幕 ≥ 768px 响应式栅格
  lg?: number; // 屏幕 ≥ 992px 响应式栅格
}

// 列宽
export const getColProps = (props: FromColProps, inline?: boolean) => {
  const { xs, sm, md, lg, span, ...restProps } = props || {};
  const maxspan = 12;
  // 计算layout带来的影响
  const getValue = (inline?: boolean, value?: number) => {
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
export const GridRow = React.forwardRef((props: GridRowProps, ref: any) => {
  const {
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

export interface GridColProps extends FromColProps, GeneratePrams {
  children: any;
}
// col组件
export const GridCol = React.forwardRef((props: GridColProps, ref: any) => {
  const {
    children,
    field,
    className,
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
