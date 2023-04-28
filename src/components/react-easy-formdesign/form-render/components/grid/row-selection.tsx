import { joinFormPath } from '@/components/react-easy-formcore';
import React from 'react';
import { isEmpty } from '@/utils/type';
import Icon from '@/components/svg-icon';
import { useFormEdit } from '@/components/react-easy-formdesign/utils/hooks';
import { insertDesignItem } from '@/components/react-easy-formdesign/utils/utils';
import BaseSelection, { CommonSelectionProps } from '@/components/react-easy-formdesign/form-designer/editor/BaseSelection';

export interface EditorSelectionProps extends CommonSelectionProps {
}
/**
 * 给表单中的控件外围添加选中框
 * @param props 
 * @param ref 
 * @returns 
 */
function RowSelection(props: EditorSelectionProps, ref: any) {
  const {
    children,
    style,
    className,
    name,
    parent,
    formparent,
    field,
    store: designer,
    form: designerForm,
    ...restProps
  } = props;

  const currentPath = isEmpty(name) ? undefined : joinFormPath(parent, name) as string;
  const setEdit = useFormEdit();

  const addCol = () => {
    const currentItem = designer?.getItemByPath(currentPath);
    const nextIndex = Object.keys(currentItem?.properties || {})?.length;
    const newField = {
      id: 'gridCol',
      component: null,
      type: 'Grid.Col',
      props: { span: 12 },
      ignore: true,
      properties: {
      }
    };
    designer && insertDesignItem(designer, newField, nextIndex, { path: currentPath });
  }

  const deleteItem = () => {
    currentPath && designer?.delItemByPath(currentPath);
    setEdit({ selected: {} })
  }

  return (
    <BaseSelection ref={ref} {...props} tools={[<Icon key="add" name="add" onClick={addCol} />, <Icon key="shanchu" name="shanchu" onClick={deleteItem} />]}>
      {children}
    </BaseSelection>
  );
};

export default React.forwardRef(RowSelection);
