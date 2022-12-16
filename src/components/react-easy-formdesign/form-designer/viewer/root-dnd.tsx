import DndSortable, { DndProps } from '@/components/react-dragger-sort';
import React from 'react';
import { GeneratePrams } from '../../form-render';
import './index.less';
import { defaultGetId } from '../utils/utils';
import { DndGroup } from '../components/list';
import { getInitialValues } from '@/components/react-easy-formrender/utils/utils';
import { ConfigElements, ELementProps } from '../components/configs';

export interface RootDndProps extends GeneratePrams<ELementProps> {
  children?: any;
}

// 根节点的拖放控制
function RootDnd(props: RootDndProps) {
  const { children, store } = props;

  const onUpdate: DndProps['onUpdate'] = (params) => {
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

  const onAdd: DndProps['onAdd'] = (params) => {
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
      const source = from?.id as string;
      const elements = ConfigElements[fromCollection?.elementType]
      const item = elements[source]
      const field = { ...item, source, ...getInitialValues(item?.settings) }
      const addItem = dropGroupIsList ? field : { ...field, name: defaultGetId(source) };
      store?.addItemByIndex(addItem, dropIndex, dropCollection?.path);
      // 容器内部拖拽
    } else {
      store?.moveItemByPath({ index: fromIndex, parent: fromCollection?.path }, { index: dropIndex, parent: dropCollection?.path });
    }
  }

  return (
    <DndSortable
      onUpdate={onUpdate}
      onAdd={onAdd}
      data-type="ignore"
      className='viewer-dnd-root'
      options={{ hiddenFrom: true }}
    // collection={{ path: '' }}
    >
      {children}
    </DndSortable>
  )
};

export default RootDnd;
