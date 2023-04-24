import DndSortable, { DndCondition, DndSortableProps } from '@/components/react-dragger-sort';
import React from 'react';
import { GeneratePrams, joinFormPath } from '../../form-render';
import './dnd.less';
import { getConfigField, insertDesignItem } from '../../utils/utils';
import { DndType, ELementProps } from '../components/configs';

export interface EditorDndProps extends GeneratePrams<ELementProps> {
  children?: any;
}

// 根节点的拖放控制
function EditorDnd(props: EditorDndProps, ref: any) {
  const { children, store, ...rest } = props;

  const {
    name,
    parent
  } = rest;

  const currentPath = joinFormPath(parent, name);

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
    store?.moveItemByPath({ index: fromIndex, parent: fromCollection?.path }, { index: dropIndex, parent: dropCollection?.path });
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
    if (fromCollection?.type === DndType.Components) {
      const elementId = from?.id as string;
      const field = getConfigField(elementId);
      store && insertDesignItem(store, field, dropIndex, { path: dropCollection?.path });
    } else {
      store?.moveItemByPath({ index: fromIndex, parent: fromCollection?.path }, { index: dropIndex, parent: dropCollection?.path });
    }
  }

  const disabledDrop: DndCondition = (param) => {
    // 禁止自定义属性被拖拽进来
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
    >
      {children}
    </DndSortable>
  )
};

export default React.forwardRef(EditorDnd);
