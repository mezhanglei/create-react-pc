import DndSortable, { DndSortableProps } from '@/components/react-dragger-sort';
import React from 'react';
import './dnd.less';
import { getInitialValues } from '@/components/react-easy-formrender/utils/utils';
import { deepMergeObject } from '@/utils/object';
import { GeneratePrams, joinFormPath } from '../..';
import { ConfigElementsMap, ELementProps } from '@/components/react-easy-formdesign/form-designer/components/configs';
import { DndGroup } from '@/components/react-easy-formdesign/form-designer/components/list';
import { getConfigSettings, insertDesignItem } from '@/components/react-easy-formdesign/utils/utils';
import { useFormDesign } from '@/components/react-easy-formdesign/utils/hooks';

export interface TableDndProps extends GeneratePrams<ELementProps> {
  children?: any;
}

// 表格拖放
function TableDnd(props: TableDndProps, ref: any) {
  const { children, store, ...rest } = props;

  const {
    name,
    parent
  } = rest;

  const { selected } = useFormDesign();
  const attributeName = selected?.attributeName;
  const attributeData = selected?.attributeData;
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
    // store?.moveItemByPath({ index: fromIndex, parent: fromCollection?.path }, { index: dropIndex, parent: dropCollection?.path });
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
    if (fromCollection?.type === DndGroup) {
      const elementId = from?.id as string;
      const item = ConfigElementsMap[elementId];
      const configSettings = getConfigSettings(item?.id);
      const field = deepMergeObject(item, getInitialValues(configSettings));
      // store && insertDesignItem(store, dropCollection?.path, { field, index: dropIndex });
      // 容器内部拖拽
    } else {
      // store?.moveItemByPath({ index: fromIndex, parent: fromCollection?.path }, { index: dropIndex, parent: dropCollection?.path });
    }
  }

  return (
    <DndSortable
      ref={ref}
      onUpdate={onUpdate}
      onAdd={onAdd}
      data-type="ignore"
      className='table-dnd'
      options={{ hiddenFrom: true }}
      collection={{ path: currentPath }}
    >
      {children}
    </DndSortable>
  )
};

export default React.forwardRef(TableDnd);
