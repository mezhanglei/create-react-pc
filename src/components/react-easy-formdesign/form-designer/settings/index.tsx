import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import { Tabs } from 'antd';
import ComponentSettings from './component-settings';
import './index.less';
import { DesignprefixCls } from '../provider';

export interface DesignSettingsProps {
  className?: string
  style?: CSSProperties
}
const prefixCls = `${DesignprefixCls}-settings`;
function DesignSettings(props: DesignSettingsProps, ref: any) {
  const {
    style,
    className
  } = props;

  const TabsData = [{
    key: 'component',
    tab: '组件配置',
    component: ComponentSettings
  }]

  const cls = classnames(prefixCls, className)

  return (
    <div ref={ref} className={cls} style={style}>
      <Tabs className='settings-tabs'>
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

DesignSettings.displayName = 'design-settings';
export default React.forwardRef(DesignSettings);
