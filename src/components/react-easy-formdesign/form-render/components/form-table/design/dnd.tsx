import DndSortable, { arrayMove, DndCondition, DndSortableProps } from '@/components/react-dragger-sort';
import React from 'react';
import './dnd.less';
import { DndType, ELementProps } from '@/components/react-easy-formdesign/form-designer/components/configs';
import { defaultGetId, getConfigField, insertDesignItem, updateDesignerItem } from '@/components/react-easy-formdesign/utils/utils';
import { GeneratePrams, joinFormPath } from '../../..';

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

  const attributeName = `props.columns`;
  const currentPath = joinFormPath(parent, name);

  const onUpdate: DndSortableProps['onUpdate'] = (params) => {
    const { from, to } = params;
    console.log(params, '同域拖放');
    const fromIndex = from?.index;
    const dropIndex = to?.index;
    if(typeof fromIndex != 'number' || typeof dropIndex !== 'number') return;
    const columns = field?.props?.columns || [];
    const oldColumns = [...columns];
    const newColumns = arrayMove(oldColumns, fromIndex, dropIndex);
    store && updateDesignerItem(store, newColumns, currentPath, attributeName);
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
    // const dropGroup = to?.group;
    // 额外传递的信息
    // const dropCollection = dropGroup?.collection;
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
      id: formField.id,
      name: defaultGetId(formField.id)
    }
    store && insertDesignItem(store, newColumn, dropIndex, { path: currentPath, attributeName: attributeName });
  }

  const disabledDrop: DndCondition = (param) => {
    // 禁止自定义属性被拖拽进来
    const fromCollection = param?.from?.group?.collection;
    if (fromCollection?.attributeName) {
      return true
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
        options={{ hiddenFrom: true, disabledDrop: disabledDrop }}
        collection={{ path: currentPath, attributeName }}
      >
        {children}
      </DndSortable>
    </div>
  )
};

export default React.forwardRef(TableDnd);
