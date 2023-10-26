import React from 'react';
import Icon from '@/components/SvgIcon';
import { defaultGetId, setDesignerItem } from '@/components/react-easy-formdesign/form-render/utils/utils';
import { deepSet, pickObject } from "@/utils/object";
import BaseSelection, { CommonSelectionProps, SelectedType } from '../../BaseSelection';
import FormTableColSetting from './column-setting';
import { ELementProps } from '../../';

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
    // ...restProps
  } = props;

  const columns = field?.props?.columns || [];
  const columnsPath = `props.columns`;
  const attributeName = `${columnsPath}[${colIndex}]`;
  const currentPath = path;
  const { setDesignState, settings } = field?.context || {};

  const onChoose = (val?: SelectedType) => {
    const type = column?.type;
    const appendSetting = type && settings ? settings[type] : undefined;
    const controlSetting = pickObject(appendSetting, (key) => key !== '公共属性');
    const mergeSetting = Object.assign({}, FormTableColSetting, controlSetting)
    setDesignState({
      selected: Object.assign({ setting: mergeSetting }, val)
    });
  }

  const copyItem = () => {
    const nextColIndex = colIndex + 1;
    const oldColumns = [...columns];
    const newColumn = {
      ...column,
      title: column?.label,
      dataIndex: defaultGetId(column?.type),
    };
    oldColumns.splice(nextColIndex, 0, newColumn);
    const newField = deepSet(field, columnsPath, oldColumns);
    designer && setDesignerItem(designer, newField, currentPath);
  }

  const deleteColumn = (e) => {
    e.stopPropagation();
    setDesignState({ selected: {} });
    designer && setDesignerItem(designer, undefined, currentPath, attributeName);
  }

  return (
    <BaseSelection
      ref={ref}
      {...props}
      configLabel="表格列"
      attributeName={attributeName}
      onChoose={onChoose}
      tools={[<Icon key="fuzhi" name="fuzhi" onClick={copyItem} />, <Icon key="shanchu" name="shanchu" onClick={deleteColumn} />]}>
      {children}
    </BaseSelection>
  );
};

export default React.forwardRef(ColumnSelection);
