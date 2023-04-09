import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import { message, Tabs } from 'antd';
import './index.less';
import { getConfigSettings, insertDesignItem } from '../../utils/utils';
import ComponentList from './list';
import { getEndIndex, getInitialValues } from '@/components/react-easy-formrender/utils/utils';
import { ELementProps, TabsData } from './configs';
import { DesignprefixCls } from '../provider';
import { useFormDesign } from '../../utils/hooks';
import { deepMergeObject } from '@/utils/object';


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

  const { selected, designer, properties } = useFormDesign();
  const selectedName = selected?.name;
  const selectedParent = selected?.parent;
  const attributeName = selected?.attributeName;
  const cls = classnames(prefixCls, className);

  const onChange = (item: ELementProps) => {
    if (attributeName) return;
    const newIndex = getEndIndex(selectedName, properties, selectedParent) + 1; // 插入位置序号
    const configSettings = getConfigSettings(item?.id);
    const field = deepMergeObject(item, getInitialValues(configSettings));
    const parentField = designer.getItemByPath(selectedParent);
    const parentIncludes = parentField?.includes;
    if (parentIncludes && !parentIncludes.includes(field.id)) {
      message.warning("当前不可插入")
      return;
    };
    insertDesignItem(designer, selectedParent, { field, index: newIndex });
  }

  return (
    <div ref={ref} className={cls} style={style}>
      <Tabs className='components-tabs'>
        {
          TabsData?.map((item) => {
            const { children, ...rest } = item;
            return (
              <Tabs.TabPane {...rest}>
                {
                  children?.map((sub, subIndex) => {
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
