import DndSortable, { DndSortableProps } from '@/components/react-dragger-sort';
import React from 'react';
import './dnd.less';
import { deepSet, GeneratePrams, joinFormPath } from '../..';
import { DndType, ELementProps } from '@/components/react-easy-formdesign/form-designer/components/configs';
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
    let formField;
    // 从侧边栏插入进来
    if (fromCollection?.type === DndType.Components) {
      const elementId = from?.id as string;
      formField = getConfigField(elementId);
      // 从表单节点中插入
    } else {
      formField = store && store.getItemByIndex(fromIndex, { path: fromCollection?.path });
      store && store.setItemByIndex(undefined, fromIndex, fromCollection?.path);
    }
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
        collection={{ path: currentPath, attributeName }}
      >
        {children}
      </DndSortable>
    </div>
  )
};

export default React.forwardRef(TableDnd);
