import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import { message } from 'antd';
import './index.less';
import { getConfigItem, getSelectedIndex, insertDesignItem } from '../../utils/utils';
import ComponentList from './list';
import { ELementProps, ComponentsSource } from './configs';
import { DesignprefixCls } from '../provider';
import { useFormDesign } from '../../utils/hooks';

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

  const { selected, designer } = useFormDesign();
  const selectedParent = selected?.parent;
  const attributeName = selected?.attributeName;
  const cls = classnames(prefixCls, className);

  const onChange = (item: ELementProps) => {
    if (attributeName) return;
    const newIndex = getSelectedIndex(selected) + 1; // 插入位置序号
    const field = getConfigItem(item?.id);
    const includesIds = selectedParent?.field?.includes;
    if (includesIds && !includesIds.includes(field.id)) {
      message.warning("当前不可插入")
      return;
    };
    insertDesignItem(designer, field, newIndex, { path: selectedParent?.path });
  }

  return (
    <div ref={ref} className={cls} style={style}>
      {
        ComponentsSource?.map((sub, subIndex) => {
          return <ComponentList {...sub} key={subIndex} onChange={onChange} />
        })
      }
    </div>
  );
};

DesignComponents.displayName = 'design-components';
export default React.forwardRef(DesignComponents);
