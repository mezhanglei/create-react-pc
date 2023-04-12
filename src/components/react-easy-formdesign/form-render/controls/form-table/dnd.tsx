import DndSortable, { DndSortableProps } from '@/components/react-dragger-sort';
import React from 'react';
import './dnd.less';
import { deepSet, GeneratePrams, joinFormPath } from '../..';
import { ELementProps } from '@/components/react-easy-formdesign/form-designer/components/configs';
import { DndGroup } from '@/components/react-easy-formdesign/form-designer/components/list';
import { defaultGetId, getConfigField, updateDesignerItem } from '@/components/react-easy-formdesign/utils/utils';
import { useFormDesign } from '@/components/react-easy-formdesign/utils/hooks';

export interface TableDndProps extends GeneratePrams<ELementProps> {
  children?: any;
}

// 表格拖放
function TableDnd(props: TableDndProps, ref: any) {
  const { children, store, ...rest } = props;

  const {
    name,
    parent,
    field
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
      const formField = getConfigField(elementId);
      // 拼接columns
      const newColumn = {
        type: formField?.type,
        props: formField?.props,
        label: formField?.label,
        id: 'formTableColumn',
        name: defaultGetId('formTableColumn'),
      }
      const columnsPath = `props.columns`;
      const columns = field?.props?.columns || [];
      const oldColumns = [...columns];
      oldColumns.splice(dropIndex, 0, newColumn);
      const newField = deepSet(field, columnsPath, oldColumns);
      store && updateDesignerItem(store, newField, currentPath);
    } else {
      // store?.moveItemByPath({ index: fromIndex, parent: fromCollection?.path }, { index: dropIndex, parent: dropCollection?.path });
    }
  }

  return (
    <div>
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
    </div>
  )
};

export default React.forwardRef(TableDnd);
