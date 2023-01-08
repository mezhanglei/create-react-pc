import React, { CSSProperties, forwardRef } from 'react';
import Provider, { DesignprefixCls } from './provider';
import Components from './components';
import Editor from './editor';
import Settings from './settings';
import classnames from 'classnames';
import { Col, Row } from 'antd';
import './index.less';

export interface DesignFormProps {
  className?: string
  style?: CSSProperties
}

const classes_design = {
  design: DesignprefixCls,
  components: `${DesignprefixCls}__components`,
  editor: `${DesignprefixCls}__editor`,
  settings: `${DesignprefixCls}__settings`
}

const Generator = ({ className, ...props }: DesignFormProps, ref: any) => {
  return (
    <Row ref={ref} className={classnames(classes_design.design, className)}>
      <Provider {...props}>
        <Col className={classes_design.components} xs={24} sm={24} md={5} lg={5}><Components /></Col>
        <Col className={classes_design.editor} xs={24} sm={24} md={14} lg={14}><Editor /></Col>
        <Col className={classes_design.settings} xs={24} sm={24} md={5} lg={5}><Settings /></Col>
      </Provider>
    </Row>
  );
}

Generator.Provider = Provider;
Generator.Components = Components;
Generator.Editor = Editor;
Generator.Settings = Settings;

export default forwardRef(Generator);