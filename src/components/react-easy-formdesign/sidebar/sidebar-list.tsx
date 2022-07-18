import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import { ELementProps, SideBarElement } from '../config';
import DndSortable from '@/components/react-dragger-sort';
import Tag from './tag';
import './sidebar-list.less';

export interface SideBarProps {
  className?: string;
  style?: CSSProperties;
  title: string;
  group: string;
  elements?: SideBarElement;
  onChange?: (name: string, item: ELementProps) => void;
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

  const renderElements = (group: string, elements?: SideBarElement) => {
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
          Object.entries(elements || {}).map(([name, field], index) => {
            return <Tag key={index} data-id={name} onChange={() => onChange?.(name, field)}>{field.label}</Tag>
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
