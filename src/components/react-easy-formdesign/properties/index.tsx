import React, { cloneElement, useCallback, useContext, useState, CSSProperties, useEffect } from 'react'
import classnames from 'classnames';
import { Tabs } from 'antd';
import { FormRenderContext } from '../design-context';
import FormItemSettings from './form-item-settings';
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

  const TabsData = [{
    key: 'component',
    tab: '属性配置',
    component: FormItemSettings
  }]

  const cls = classnames(prefixCls, className)

  return (
    <div ref={ref} className={cls} style={style}>
      <Tabs className='properties-tabs'>
        {
          TabsData?.map((item) => {
            const { component: TabChildren, ...rest } = item
            return (
              <Tabs.TabPane {...rest}>
                <TabChildren />
              </Tabs.TabPane>
            )
          })
        }
      </Tabs>
    </div>
  )
};

DesignProperties.displayName = 'design-properties';
export default React.forwardRef(DesignProperties);
