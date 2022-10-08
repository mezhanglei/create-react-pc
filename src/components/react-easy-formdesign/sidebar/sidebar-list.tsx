import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import { ELementProps } from '../config';
import DndSortable from '@/components/react-dragger-sort';
import Tag from './tag';
import './sidebar-list.less';

export interface SideBarProps {
  className?: string;
  style?: CSSProperties;
  title: string;
  group: string;
  elements?: ELementProps[];
  onChange?: (name: string, item: ELementProps, group?: string) => void;
}
const prefixCls = 'sidebar-list';
function SideBarList(props: SideBarProps, ref: any) {
  const {
    style,
    className,
    title,
    group,
    elements,
    onChange
  } = props;

  const cls = classnames(prefixCls, className)

  const renderElements = (group: string, elements?: ELementProps[]) => {
    return (
      <DndSortable
        className='elements-list'
        options={{
          groupPath: group,
          childDrag: true,
          allowDrop: false,
          allowSort: false
        }}
      >
        {
          elements?.map((item, index) => {
            const prefix = item?.prefix;
            return <Tag key={index} data-id={prefix} onChange={() => onChange?.(prefix, item, group)}>{item.label}</Tag>
          })
        }
      </DndSortable>
    );
  }

  return (
    <div ref={ref} className={cls} style={style}>
      <div>
        <div>{title}</div>
        {renderElements(group, elements)}
      </div>
    </div>
  );
};

SideBarList.displayName = 'design-sidebar-list';
export default React.forwardRef(SideBarList);
