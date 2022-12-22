import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import DndSortable from '@/components/react-dragger-sort';
import Tag from './tag';
import './list.less';
import { ELementProps } from './configs';
import { IconFonts } from './iconfont';

export interface ComponentListProps {
  className?: string;
  style?: CSSProperties;
  title: string;
  elementType: string;
  elements?: ELementProps[];
  tabKey: string;
  onChange?: (item: ELementProps, elementType?: string, tabKey?: string) => void;
}
export const DndGroup = 'components'
const prefixCls = 'components-list';
function ComponentList(props: ComponentListProps, ref: any) {
  const {
    style,
    className,
    title,
    elements,
    tabKey,
    elementType,
    onChange
  } = props;

  const cls = classnames(prefixCls, className)

  const renderElements = () => {
    return (
      <DndSortable
        className='elements-list'
        collection={{ type: DndGroup, tabKey: tabKey, elementType: elementType }}
      >
        {
          elements?.map((item, index) => {
            const id = item?.id as string;
            return <Tag key={index} data-id={id} icon={IconFonts[id]} onChange={() => onChange?.(item, elementType, tabKey)}>{item.label}</Tag>
          })
        }
      </DndSortable>
    );
  }

  return (
    <div ref={ref} className={cls} style={style}>
      <div>
        <div>{title}</div>
        {renderElements()}
      </div>
    </div>
  );
};

export default React.forwardRef(ComponentList);
