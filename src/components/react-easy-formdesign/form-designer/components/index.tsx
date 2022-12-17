import React, { useContext, CSSProperties } from 'react';
import classnames from 'classnames';
import { Tabs } from 'antd';
import './index.less';
import { defaultGetId } from '../utils/utils';
import ComponentList from './list';
import { endIsListItem, getEndIndex, getInitialValues } from '@/components/react-easy-formrender/utils/utils';
import { ELementProps, TabsData } from '../components/configs';
import { FormDesignContext } from '../designer-context';
import { getCurrentPath } from '../../form-render';
import { DesignprefixCls } from '..';


export interface DesignComponentsProps {
  className?: string
  style?: CSSProperties
}

const prefixCls = `${DesignprefixCls}-components`;
function DesignComponents(props: DesignComponentsProps, ref: any) {
  const {
    style,
    className
  } = props;

  const { designer, selected, properties } = useContext(FormDesignContext);
  const selectedName = selected?.name;
  const selectedParent = selected?.parent;
  const selectedPath = getCurrentPath(selectedName, selectedParent) as string;
  const cls = classnames(prefixCls, className);

  const onChange = (source: string, item: ELementProps) => {
    const newIndex = getEndIndex(selectedName, properties, selectedParent) + 1; // 插入位置序号
    const isListItem = endIsListItem(selectedPath);
    const field = { ...item, ...getInitialValues(item?.settings) };
    // 非数组项需要生成id
    const addItem = isListItem ? field : { ...field, name: defaultGetId(source) };
    designer?.addItemByIndex(addItem, newIndex, selectedParent);
  }

  return (
    <div ref={ref} className={cls} style={style}>
      <Tabs className='components-tabs'>
        {
          TabsData?.map((item) => {
            const { data, ...rest } = item;
            return (
              <Tabs.TabPane {...rest}>
                {
                  data?.map((sub, subIndex) => {
                    return <ComponentList {...sub} tabKey={rest?.key} key={subIndex} onChange={onChange} />
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

DesignComponents.displayName = 'design-components';
export default React.forwardRef(DesignComponents);
