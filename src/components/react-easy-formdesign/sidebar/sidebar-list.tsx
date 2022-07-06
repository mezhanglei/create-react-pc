import React, { CSSProperties } from 'react'
import classnames from 'classnames';
import { SideBarElement, TabContent } from '../config';
import DndSortable from '@/components/react-dragger-sort';
import Tag from './tag';
import './sidebar-list.less';

export interface SideBarProps {
  className?: string
  style?: CSSProperties
  data?: TabContent[]
  onChange?: (name: string, item: SideBarElement) => void
}
const prefixCls = 'sidebar-list';
function SideBarList(props: SideBarProps, ref: any) {
  const {
    style,
    className,
    data,
    onChange
  } = props;

  const cls = classnames(prefixCls, className)

  const renderElements = (group: string, elements: TabContent['elements']) => {
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

  const renderContent = () => {
    return data?.map((item, index) => {
      return (
        <div key={index}>
          <div>{item?.title}</div>
          {renderElements(item?.group, item?.elements)}
        </div>
      );
    })
  }

  return (
    <div ref={ref} className={cls} style={style}>
      {renderContent()}
    </div>
  );
};

SideBarList.displayName = 'design-sidebar-list';
export default React.forwardRef(SideBarList);
