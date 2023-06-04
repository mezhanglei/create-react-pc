import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import DndSortable from '@/components/react-dragger-sort';
import Tag from './tag';
import './list.less';
import { DndType, ELementProps } from './configs/index';

export interface ComponentListProps {
  className?: string;
  style?: CSSProperties;
  title: string;
  elementType: string;
  elements?: ELementProps[];
  onChange?: (item: ELementProps, elementType?: string) => void;
}
const prefixCls = 'components-list';
function ComponentList(props: ComponentListProps, ref: any) {
  const {
    style,
    className,
    title,
    elements,
    elementType,
    onChange
  } = props;

  const cls = classnames(prefixCls, className)

  const renderElements = () => {
    return (
      <DndSortable
        className='elements-list'
        collection={{ type: DndType.Components }}
        options={{
          disabledDrop: true,
          hiddenFrom: false,
          disabledSort: true
        }}
      >
        {
          elements?.map((item, index) => {
            const id = item?.id as string;
            return <Tag key={index} data-id={id} icon={item?.icon} onChange={() => onChange?.(item, elementType)}>{item?.componentLabel}</Tag>
          })
        }
      </DndSortable>
    );
  }

  return (
    <div ref={ref} className={cls} style={style}>
      <div>
        <div className={`${prefixCls}-title`}>{title}</div>
        {renderElements()}
      </div>
    </div>
  );
};

export default React.forwardRef(ComponentList);
