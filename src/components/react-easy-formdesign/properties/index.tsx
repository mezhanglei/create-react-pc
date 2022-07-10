import React, { cloneElement, useCallback, useContext, useState, CSSProperties, useEffect } from 'react'
import classnames from 'classnames';
import { Tabs } from 'antd';
import { FormRenderContext } from '../design-context';
import ItemSettings from './item-settings';
import GlobalSettings from './global-settings';
import './index.less';

export interface DesignPropertiesProps {
  className?: string
  style?: CSSProperties
}
const prefixCls = 'easy-form-design-properties';
function DesignProperties(props: DesignPropertiesProps, ref: any) {
  const {
    style,
    className
  } = props;

  const cls = classnames(prefixCls, className)

  return (
    <div ref={ref} className={cls} style={style}>
      <Tabs className='properties-tabs' defaultActiveKey="1">
        <Tabs.TabPane tab="组件配置" key="1">
          <ItemSettings />
        </Tabs.TabPane>
        <Tabs.TabPane tab="表单配置" key="2">
          <GlobalSettings />
        </Tabs.TabPane>
      </Tabs>
    </div>
  )
};

DesignProperties.displayName = 'design-properties';
export default React.forwardRef(DesignProperties);
