import DndSortable, { DndSortableProps } from '@/components/react-dragger-sort';
import React from 'react';
import { GeneratePrams } from '../../form-render';
import './dnd.less';
import { defaultGetId } from '../../utils/utils';
import { DndGroup } from '../components/list';
import { getInitialValues } from '@/components/react-easy-formrender/utils/utils';
import { ConfigElementsMap, ELementProps } from '../components/configs';
import { deepMergeObject } from '@/utils/object';

export interface EditorDndProps extends GeneratePrams<ELementProps> {
  children?: any;
}

// 根节点的拖放控制
function EditorDnd(props: EditorDndProps, ref) {
  const { children, store } = props;

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
    const dropIndex = to?.index;
    const parentData = store?.getItemByPath(dropCollection?.path)
    const dropGroupIsList = parentData instanceof Array;
    // 从侧边栏插入进来
    if (fromCollection?.type === DndGroup) {
      const elementId = from?.id as string;
      const item = ConfigElementsMap[elementId];
      const field = deepMergeObject(item, getInitialValues(item?.settings));
      const addItem = dropGroupIsList ? field : { ...field, name: defaultGetId(item?.id) };
      store?.addItemByIndex(addItem, dropIndex, dropCollection?.path);
      // 容器内部拖拽
    } else {
      store?.moveItemByPath({ index: fromIndex, parent: fromCollection?.path }, { index: dropIndex, parent: dropCollection?.path });
    }
  }

  return (
    <DndSortable
      ref={ref}
      onUpdate={onUpdate}
      onAdd={onAdd}
      data-type="ignore"
      className='editor-dnd-root'
      options={{ hiddenFrom: true }}
    // collection={{ path: '' }}
    >
      {children}
    </DndSortable>
  )
};

export default React.forwardRef(EditorDnd);
