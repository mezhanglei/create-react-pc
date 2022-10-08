import React, { cloneElement, useCallback, useContext, useState, CSSProperties, useEffect } from 'react';
import classnames from 'classnames';
import { Tabs } from 'antd';
import './index.less';
import { atomElements, ELementProps, exampleElements, layoutElements } from '../config';
import { FormEditContext, FormRenderContext } from '../design-context';
import { defaultGetId, getParent, getSelectedIndex, endIsListItem } from '../utils/utils';
import SidebarList from './sidebar-list';
import { pathToArray } from '@/components/react-easy-formrender/utils/utils';
import { getCurrentPath } from '@/components/react-easy-formcore';

export interface DesignComponentsProps {
  className?: string
  style?: CSSProperties
}

const prefixCls = 'easy-form-design-sidebar';
export const SideBarGroupPath = 'sidebar'
function DesignComponents(props: DesignComponentsProps, ref: any) {
  const {
    style,
    className
  } = props;

  const { viewerRenderStore, selected, schema } = useContext(FormRenderContext);
  const setEdit = useContext(FormEditContext);

  const cls = classnames(prefixCls, className);

  const onChange = (prefix: string, item: ELementProps) => {
    handleControl(prefix, item);
  }

  // 处理基础控件
  const handleControl = (prefix: string, item: ELementProps) => {
    let newId;
    if (endIsListItem(selected)) {
      // 当选中项为为空数组内部，则设置为空字符串
      const end = pathToArray(selected)?.pop() as string || '-1';
      newId = `[${+end + 1}]`;
    } else {
      // 非数组项才生成id
      newId = defaultGetId(prefix);
    }
    const newIndex = getSelectedIndex(selected, schema?.properties) + 1; // 插入位置序号
    const parentPath = getParent(selected); // 插入的父元素路径
    // 生成新控件
    const addItem = { name: newId, field: item };
    const newPath = getCurrentPath(newId, parentPath);
    viewerRenderStore?.addItemByIndex(addItem, newIndex, parentPath);
    setEdit({ selected: newPath });
  }

  return (
    <div ref={ref} className={cls} style={style}>
      <Tabs className='sidebar-tabs' defaultActiveKey="1">
        <Tabs.TabPane tab="基础组件" key="1">
          <SidebarList title="基础控件" group="sidebar.atomElements" elements={atomElements} onChange={onChange} />
          <SidebarList title="布局组件" group="sidebar.layoutElements" elements={layoutElements} onChange={onChange} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="复杂组件" key="2">
          <SidebarList title="复杂示例" group="sidebar.exampleElements" elements={exampleElements} onChange={onChange} />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

DesignComponents.displayName = 'design-sidebar';
export default React.forwardRef(DesignComponents);
