import React from 'react';
import Icon from '@/components/svg-icon';
import { useFormEdit } from '@/components/react-easy-formdesign/utils/hooks';
import { insertDesignItem } from '@/components/react-easy-formdesign/utils/utils';
import BaseSelection, { CommonSelectionProps } from '@/components/react-easy-formdesign/form-designer/editor/baseSelection';
import classnames from 'classnames';
import './row-selection.less';

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
    path,
    field,
    parent,
    formrender: designer,
    form: designerForm,
    ...restProps
  } = props;

  const currentPath = path;
  const setEdit = useFormEdit();

  const addCol = () => {
    const currentItem = designer?.getItemByPath(currentPath);
    const nextIndex = Object.keys(currentItem?.properties || {})?.length;
    const newField = {
      id: 'gridCol',
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

  const prefixCls = "row-selection";
  const cls = classnames(prefixCls, className);

  return (
    <BaseSelection
      ref={ref}
      {...props}
      componentLabel="栅格布局"
      className={cls}
      tools={[<Icon key="add" name="add" onClick={addCol} />, <Icon key="shanchu" name="shanchu" onClick={deleteItem} />]}>
      {children}
    </BaseSelection>
  );
};

export default React.forwardRef(RowSelection);
