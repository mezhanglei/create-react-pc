import { joinFormPath } from '@/components/react-easy-formcore';
import classnames from 'classnames';
import React, { CSSProperties } from 'react';
import './column-selection.less';
import { isEmpty } from '@/utils/type';
import Icon from '@/components/svg-icon';
import { ELementProps } from '@/components/react-easy-formdesign/form-designer/components/configs';
import { useFormDesign, useFormEdit } from '@/components/react-easy-formdesign/utils/hooks';
import { defaultGetId, updateDesignerItem } from '@/components/react-easy-formdesign/utils/utils';
import { deepSet } from "@/utils/object";
import { GeneratePrams } from '../../..';

export interface ColumnSelectionProps extends GeneratePrams<ELementProps> {
  children?: any;
  style?: CSSProperties;
  className?: string;
  colIndex: number;
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
    name,
    parent,
    formparent,
    field,
    store: designer,
    form: designerForm,
    colIndex,
    ...restProps
  } = props;

  const columns = field?.props?.columns || [];
  const columnsPath = `props.columns`;
  const attributeName = `${columnsPath}[${colIndex}]`;
  const column = columns[colIndex];
  const currentPath = isEmpty(name) ? undefined : joinFormPath(parent, name) as string;
  const attributePath = joinFormPath(currentPath, attributeName);
  const setEdit = useFormEdit();
  const { selected, selectedPath } = useFormDesign();
  const isSelected = attributePath ? attributePath === joinFormPath(selectedPath, selected?.attributeName) : false;

  const addColumn = () => {
    const nextColIndex = colIndex + 1;
    const oldColumns = [...columns];
    const newColumn = {
      ...column,
    };
    oldColumns.splice(nextColIndex, 0, newColumn);
    const newField = deepSet(field, columnsPath, oldColumns);
    designer && updateDesignerItem(designer, newField, currentPath);
  }

  const deleteColumn = () => {
    designer && updateDesignerItem(designer, undefined, currentPath, attributeName);
    setEdit({ selected: {} });
  }

  const chooseItem = (e: any) => {
    e.stopPropagation();
    setEdit({
      selected: {
        name: name as string,
        attributeName: attributeName,
        parent: parent,
        formparent: formparent,
        field: field
      }
    })
  }

  const prefixCls = "column-selection";

  const cls = classnames(prefixCls, className, {
    [`${prefixCls}-active`]: isSelected,
  });

  const classes = {
    mask: `${prefixCls}-mask`
  }

  const Tool = (
    <div className='selection-tools'>
      <Icon name="fuzhi" onClick={addColumn} />
      <Icon name="shanchu" onClick={deleteColumn} />
    </div>
  );

  return (
    <div ref={ref} className={cls} style={style} onClick={chooseItem} {...restProps}>
      {isSelected ? Tool : null}
      {children}
      {field?.disabledEdit && <div className={classes.mask}></div>}
    </div>
  );
};

export default React.forwardRef(ColumnSelection);
