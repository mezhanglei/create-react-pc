import React, { cloneElement, useCallback, useContext, useState, CSSProperties, useEffect } from 'react';
import classnames from 'classnames';
import { Tabs } from 'antd';
import './index.less';
import { atomElements, ELementProps, exampleElements, layoutElements } from '../config';
import { FormEditContext, FormRenderContext } from '../design-context';
import { defaultGetId } from '../utils/utils';
import SidebarList from './sidebar-list';
import { endIsListItem, getInitialValues, getParent, getPathEnd, getPathEndIndex } from '@/components/react-easy-formrender/utils/utils';
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

  const { viewerRenderStore, selected, schema } = useContext(FormRenderContext);
  const setEdit = useContext(FormEditContext);

  const cls = classnames(prefixCls, className);

  const onChange = (prefix: string, item: ELementProps) => {
    let newId;
    // 如果选中为数组项，则在其后面添加
    if (endIsListItem(selected)) {
      const end = getPathEnd(selected) || '-1';
      newId = `[${+end + 1}]`;
    } else {
      // 非数组项才生成id
      newId = defaultGetId(prefix);
    }
    const newIndex = getPathEndIndex(selected, schema?.properties) + 1; // 插入位置序号
    const parentPath = getParent(selected); // 插入的父元素路径
    // 生成新控件
    const field = { ...item, ...getInitialValues(item?.settings) }
    const addItem = { name: newId, field: field };
    const newPath = getCurrentPath(newId, parentPath);
    viewerRenderStore?.addItemByIndex(addItem, newIndex, parentPath);
    setEdit({ selected: newPath });
  }

  const TabsData = [{
    key: 'base',
    tab: '基础组件',
    data: [
      { title: '基础控件', elementsKey: 'atomElements', elements: atomElements },
      { title: '布局组件', elementsKey: 'layoutElements', elements: layoutElements }
    ]
  }, {
    key: 'example',
    tab: '表单模板',
    data: [
      { title: '示例', elementsKey: 'exampleElements', elements: exampleElements },
    ]
  }]

  return (
    <div ref={ref} className={cls} style={style}>
      <Tabs className='sidebar-tabs'>
        {
          TabsData?.map((item) => {
            const { data, ...rest } = item;
            return (
              <Tabs.TabPane {...rest}>
                {
                  data?.map((sub, subIndex) => {
                    return <SidebarList {...sub} tabKey={rest?.key} key={subIndex} onChange={onChange} />
                  })
                }
              </Tabs.TabPane>
            )
          })
        }
      </Tabs>
    </div>
  );
};

DesignComponents.displayName = 'design-sidebar';
export default React.forwardRef(DesignComponents);
