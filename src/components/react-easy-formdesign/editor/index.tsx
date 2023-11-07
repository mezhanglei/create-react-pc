import React, { CSSProperties, forwardRef } from 'react';
import Provider from './provider';
import Components from './components';
import EditorCore from './core';
import Setting from './setting';
import classnames from 'classnames';
import { Col, Row } from 'antd';
import './index.less';

export interface EasyFormEditorProps {
  className?: string
  style?: CSSProperties
}

const Generator = ({ className, ...props }: EasyFormEditorProps, ref: any) => {
  return (
    <Row ref={ref} className={classnames('easy-form-container', className)}>
      <Provider {...props}>
        <Col className='components' xs={24} sm={24} md={5} lg={5}><Components /></Col>
        <Col className='editor' xs={24} sm={24} md={14} lg={14}><EditorCore /></Col>
        <Col className='settings' xs={24} sm={24} md={5} lg={5}><Setting /></Col>
      </Provider>
    </Row>
  );
}

Generator.Provider = Provider;
Generator.Components = Components;
Generator.Editor = EditorCore;
Generator.Setting = Setting;

export default forwardRef(Generator);