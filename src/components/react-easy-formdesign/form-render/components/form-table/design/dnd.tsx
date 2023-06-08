import DndSortable, { arrayMove, DndCondition, DndSortableProps } from '@/components/react-dragger-sort';
import React from 'react';
import './dnd.less';
import { DndType, ELementProps } from '@/components/react-easy-formdesign/form-designer/components/configs';
import { defaultGetId, getConfigItem, insertDesignItem, setDesignerItem } from '@/components/react-easy-formdesign/utils/utils';
import { GeneratePrams } from '../../..';
import { DndCollectionType } from '@/components/react-easy-formdesign/form-designer/designer-context';
import { useFormDesign, useFormEdit } from '@/components/react-easy-formdesign/utils/hooks';

export interface TableDndProps extends GeneratePrams<ELementProps> {
  children?: any;
}

// 表格拖放
function TableDnd(props: TableDndProps, ref: any) {
  const { children, formrender, path, field, ...rest } = props;

  const attributeName = `props.columns`;
  const currentPath = path;
  const { setEdit } = useFormEdit();
  const { settingsForm } = useFormDesign();

  const removeSelect = () => {
    setEdit({ selected: {} });
    settingsForm && settingsForm.reset();
  }

  const onUpdate: DndSortableProps['onUpdate'] = (params) => {
    const { from, to } = params;
    console.log(params, '同域拖放');
    const fromIndex = from?.index;
    const dropIndex = to?.index;
    if (typeof fromIndex != 'number' || typeof dropIndex !== 'number') return;
    const columns = field?.props?.columns || [];
    const oldColumns = [...columns];
    const newColumns = arrayMove(oldColumns, fromIndex, dropIndex);
    formrender && setDesignerItem(formrender, newColumns, currentPath, attributeName);
    removeSelect()
  }

  const onAdd: DndSortableProps['onAdd'] = (params) => {
    const { from, to } = params;
    console.log(params, '跨域拖放');
    // 拖拽区域信息
    const fromGroup = from.group;
    // 额外传递的信息
    const fromCollection = fromGroup?.collection as DndCollectionType;
    const fromIndex = from?.index;
    if (typeof fromIndex != 'number') return
    // 拖放区域的信息
    // const dropGroup = to?.group;
    // 额外传递的信息
    // const dropCollection = dropGroup?.collection as DndCollectionType;
    const dropIndex = to?.index || 0;
    let formField;
    // 从侧边栏插入进来
    if (fromCollection?.type === DndType.Components) {
      const elementId = from?.id as string;
      formField = getConfigItem(elementId);
      // 从表单节点中插入
    } else {
      formField = formrender && formrender.getItemByIndex(fromIndex, { path: fromCollection?.path });
      formrender && formrender.setItemByIndex(undefined, fromIndex, { path: fromCollection?.path });
    }
    // 拼接column
    const newColumn = {
      ...formField,
      id: "FormTableCol",
      subId: formField?.id,
      title: formField?.label,
      dataIndex: defaultGetId(formField.id)
    }
    formrender && insertDesignItem(formrender, newColumn, dropIndex, { path: currentPath, attributeName: attributeName });
    removeSelect();
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
      className='table-dnd'
      options={{ hiddenFrom: true, disabledDrop: disabledDrop }}
      collection={{ path: currentPath, attributeName }}
    >
      {children}
    </DndSortable>
  )
};

export default React.forwardRef(TableDnd);
