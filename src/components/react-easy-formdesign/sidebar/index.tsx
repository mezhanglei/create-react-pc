import React, { cloneElement, useCallback, useContext, useState, CSSProperties, useEffect } from 'react';
import classnames from 'classnames';
import { Tabs } from 'antd';
import './index.less';
import { atomElements, ELementProps, exampleElements, layoutElements } from '../config';
import { FormEditContext, FormRenderContext } from '../design-context';
import { defaultGetId, getParent, getSelectedIndex, isSelecteList } from '../utils/utils';
import SidebarList from './sidebar-list';
import { pathToArray } from '@/components/react-easy-formrender/utils/utils';
import { getCurrentPath } from '@/components/react-easy-formcore';

export interface DesignComponentsProps {
  className?: string
  style?: CSSProperties
}

const prefixCls = 'easy-form-design-sidebar';
function DesignComponents(props: DesignComponentsProps, ref: any) {
  const {
    style,
    className
  } = props;

  const { formRenderStore, selected, schema } = useContext(FormRenderContext);
  const setEdit = useContext(FormEditContext);

  const cls = classnames(prefixCls, className);

  const onChange = (name: string, item: ELementProps) => {
    let newId;
    if (isSelecteList(selected)) {
      // 当选中项为为空数组内部，则设置为空字符串
      const end = pathToArray(selected)?.pop() as string || '-1';
      newId = `[${+end + 1}]`;
    } else {
      // 非数组项才生成id
      newId = defaultGetId(name);
    }
    const newIndex = getSelectedIndex(selected, schema?.properties) + 1; // 插入位置序号
    const parentPath = getParent(selected); // 插入的父元素路径
    const { settings, ...field } = item;
    // 生成新控件
    const addItem = { name: newId, field: field };
    formRenderStore?.addItemByIndex(addItem, newIndex, parentPath);
    const newPath = getCurrentPath(newId, parentPath);
    setEdit({ selected: newPath, selectedType: name });
  }

  return (
    <div ref={ref} className={cls} style={style}>
      <Tabs className='sidebar-tabs' defaultActiveKey="1">
        <Tabs.TabPane tab="基础组件" key="1">
          <SidebarList title="基础控件" group="sidebar" elements={atomElements} onChange={onChange} />
          <SidebarList title="布局组件" group="sidebar" elements={layoutElements} onChange={onChange} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="复杂组件" key="2">
          <SidebarList title="复杂示例" group="sidebar" elements={exampleElements} onChange={onChange} />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

DesignComponents.displayName = 'design-sidebar';
export default React.forwardRef(DesignComponents);
