import React from 'react';
import Icon from '@/components/svg-icon';
import { defaultGetId, setDesignerItem } from '@/components/react-easy-formdesign/utils/utils';
import { deepSet } from "@/utils/object";
import BaseSelection, { CommonSelectionProps } from '@/components/react-easy-formdesign/form-designer/editor/baseSelection';
import { ELementProps } from '@/components/react-easy-formdesign/form-designer/components/configs';
import { useFormEdit } from '@/components/react-easy-formdesign/utils/hooks';

export interface ColumnSelectionProps extends CommonSelectionProps {
  colIndex: number;
  column: ELementProps;
}
/**
 * 给表单中的控件外围添加选中框
 * @param props 
 * @param ref 
 * @returns 
 */
function ColumnSelection(props: ColumnSelectionProps, ref: any) {
  const {
    children,
    style,
    className,
    path,
    field,
    parent,
    formrender: designer,
    form: designerForm,
    colIndex,
    column,
    ...restProps
  } = props;

  const columns = field?.props?.columns || [];
  const columnsPath = `props.columns`;
  const attributeName = `${columnsPath}[${colIndex}]`;
  const currentPath = path;
  const { setEdit } = useFormEdit();

  const copyItem = () => {
    const nextColIndex = colIndex + 1;
    const oldColumns = [...columns];
    const newColumn = {
      ...column,
      title: column?.label,
      dataIndex: defaultGetId(column?.id),
    };
    oldColumns.splice(nextColIndex, 0, newColumn);
    const newField = deepSet(field, columnsPath, oldColumns);
    designer && setDesignerItem(designer, newField, currentPath);
  }

  const deleteColumn = (e) => {
    e.stopPropagation();
    setEdit({ selected: {} });
    designer && setDesignerItem(designer, undefined, currentPath, attributeName);
  }

  return (
    <BaseSelection
      ref={ref}
      {...props}
      componentLabel="表格列"
      attributeName={attributeName}
      tools={[<Icon key="fuzhi" name="fuzhi" onClick={copyItem} />, <Icon key="shanchu" name="shanchu" onClick={deleteColumn} />]}>
      {children}
    </BaseSelection>
  );
};

export default React.forwardRef(ColumnSelection);
