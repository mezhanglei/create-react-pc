import React, { CSSProperties, forwardRef } from 'react';
import Provider from './provider';
import Sidebar from './sidebar';
import Viewer from './viewer';
import Properties from './properties';
import classnames from 'classnames';
import { Col, Row } from 'react-flexbox-grid';
import './design.less';

export interface DesignFormProps {
  className?: string
  style?: CSSProperties
}

const prefixCls = 'fr-generator-container';
const classes_design = {
  design: prefixCls,
  sidebar: `${prefixCls}__sidebar`,
  viewer: `${prefixCls}__viewer`,
  properties: `${prefixCls}__properties`
}

const Generator = ({ className, ...props }: DesignFormProps, ref: any) => {
  return (
    <Provider ref={ref} {...props}>
      <Row className={classnames(classes_design.design, className)}>
        <Col className={classes_design.sidebar} xs={12} sm={6} md={4} lg={4}><Sidebar /></Col>
        <Col className={classes_design.viewer} xs={12} sm={6} md={4} lg={4}><Viewer /></Col>
        <Col className={classes_design.properties} xs={12} sm={6} md={4} lg={4}><Properties /></Col>
      </Row>
    </Provider>
  );
}

Generator.Provider = Provider;
Generator.Sidebar = Sidebar;
Generator.Viewer = Viewer;
Generator.Properties = Properties;

export default forwardRef(Generator);