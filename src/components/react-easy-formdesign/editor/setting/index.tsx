import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import { Tabs } from 'antd';
import ComponentSetting from './component';
import './index.less';

export interface EditorSettingProps {
  className?: string
  style?: CSSProperties
}
const prefixCls = `easy-form-setting`;
function EditorSetting(props: EditorSettingProps, ref: any) {
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

EditorSetting.displayName = 'editor-setting';
export default React.forwardRef(EditorSetting);
