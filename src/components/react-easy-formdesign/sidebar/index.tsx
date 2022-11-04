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

  const { designer, selected, properties } = useContext(FormRenderContext);
  const cls = classnames(prefixCls, className);

  const onChange = (prefix: string, item: ELementProps) => {
    const newIndex = getPathEndIndex(selected, properties) + 1; // 插入位置序号
    const parentPath = getParent(selected); // 插入的父元素路径
    const isListItem = endIsListItem(selected);
    const field = { ...item, ...getInitialValues(item?.settings) }
    // 非数组项需要生成id
    const addItem = isListItem ? field : { name: defaultGetId(prefix), ...field };
    designer?.addItemByIndex(addItem, newIndex, parentPath);
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
