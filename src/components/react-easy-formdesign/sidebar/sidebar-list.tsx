import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import DndSortable from '@/components/react-dragger-sort';
import Tag from './tag';
import './sidebar-list.less';
import { ELementProps } from './components';

export interface SideBarProps {
  className?: string;
  style?: CSSProperties;
  title: string;
  elementsKey: string;
  elements?: ELementProps[];
  tabKey: string;
  onChange?: (name: string, item: ELementProps, elementsKey?: string, tabKey?: string) => void;
}
export const SideBarGroup = 'sidebar'
const prefixCls = 'sidebar-list';
function SideBarList(props: SideBarProps, ref: any) {
  const {
    style,
    className,
    title,
    elementsKey,
    elements,
    tabKey,
    onChange
  } = props;

  const cls = classnames(prefixCls, className)

  const renderElements = () => {
    return (
      <DndSortable
        className='elements-list'
        collection={{ type: SideBarGroup, tabKey: tabKey, elementsKey: elementsKey }}
        options={{
          childDrag: true,
          allowDrop: false,
          allowSort: false
        }}
      >
        {
          elements?.map((item, index) => {
            const prefix = item?.prefix;
            return <Tag key={index} data-id={prefix} onChange={() => onChange?.(prefix, item, elementsKey, tabKey)}>{item.label}</Tag>
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

SideBarList.displayName = 'design-sidebar-list';
export default React.forwardRef(SideBarList);
