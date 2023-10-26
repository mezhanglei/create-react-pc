import DndSortable, { DndCondition, DndSortableProps } from '@/components/react-dragger-sort';
import React from 'react';
import './index.less';
import { getConfigItem, insertDesignItem } from '../../utils/utils';
import { ELementProps } from '..';
import { GenerateParams } from '../..';

export interface ControlDndProps extends GenerateParams<ELementProps> {
  children?: any;
}

// 控件的拖放区域组件
function FormDnd(props: ControlDndProps, ref: any) {
  const { children, formrender, path, field, ...rest } = props;
  const { components, settings } = field?.context || {};

  const currentPath = path;

  const onUpdate: DndSortableProps['onUpdate'] = (params) => {
    const { from, to } = params;
    console.log(params, '同域拖放');
    // 拖拽区域信息
    const fromGroup = from.group;
    // 额外传递的信息
    const fromCollection = fromGroup?.collection;
    const fromIndex = from?.index;
    if (typeof fromIndex != 'number') return
    // 拖放区域的信息
    const dropGroup = to?.group;
    // 额外传递的信息
    const dropCollection = dropGroup?.collection;
    const dropIndex = to?.index;
    formrender?.moveItemByPath({ index: fromIndex, parent: fromCollection?.path }, { index: dropIndex, parent: dropCollection?.path });
  }

  const onAdd: DndSortableProps['onAdd'] = (params) => {
    const { from, to } = params;
    console.log(params, '跨域拖放');
    // 拖拽区域信息
    const fromGroup = from.group;
    // 额外传递的信息
    const fromCollection = fromGroup?.collection;
    const fromIndex = from?.index;
    if (typeof fromIndex != 'number') return
    // 拖放区域的信息
    const dropGroup = to?.group;
    // 额外传递的信息
    const dropCollection = dropGroup?.collection;
    const dropIndex = to?.index || 0;
    // 从侧边栏插入进来
    if (fromCollection?.type === 'components') {
      const type = from?.id as string;
      const field = getConfigItem(type, components, settings);
      formrender && insertDesignItem(formrender, field, dropIndex, { path: dropCollection?.path });
    } else {
      formrender?.moveItemByPath({ index: fromIndex, parent: fromCollection?.path }, { index: dropIndex, parent: dropCollection?.path });
    }
  }

  const disabledDrop: DndCondition = (param) => {
    // 如果目标来自于attributeName，则不允许放进来
    const fromCollection = param?.from?.group?.collection;
    if (fromCollection?.attributeName) {
      return true
    }
  }

  return (
    <DndSortable
      ref={ref}
      onUpdate={onUpdate}
      onAdd={onAdd}
      data-type="ignore"
      className='editor-dnd'
      options={{ hiddenFrom: true, disabledDrop: disabledDrop }}
      collection={{ path: currentPath }}
      {...rest}
    >
      {children}
    </DndSortable>
  )
};

export default React.forwardRef(FormDnd);
