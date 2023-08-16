import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import { Tabs } from 'antd';
import ComponentSetting from './component';
import './index.less';
import { DesignprefixCls } from '../provider';

export interface DesignSettingProps {
  className?: string
  style?: CSSProperties
}
const prefixCls = `${DesignprefixCls}-setting`;
function DesignSetting(props: DesignSettingProps, ref: any) {
  const {
    style,
    className
  } = props;

  const TabsData = [{
    key: 'component',
    tab: '组件配置',
    component: ComponentSetting
  }]

  const cls = classnames(prefixCls, className)

  return (
    <div ref={ref} className={cls} style={style}>
      <Tabs className='setting-tabs'>
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

DesignSetting.displayName = 'design-setting';
export default React.forwardRef(DesignSetting);
