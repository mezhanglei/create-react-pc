import { joinFormPath, isValidNumber } from '@/components/react-easy-formcore';
import classnames from 'classnames';
import React, { CSSProperties } from 'react';
import './selection.less';
import { isEmpty } from '@/utils/type';
import Icon from '@/components/svg-icon';
import { GeneratePrams } from '../..';
import { ELementProps } from '@/components/react-easy-formdesign/form-designer/components/configs';
import { useFormDesign, useFormEdit } from '@/components/react-easy-formdesign/utils/hooks';
import { defaultGetId } from '@/components/react-easy-formdesign/utils/utils';

export interface EditorSelectionProps extends GeneratePrams<ELementProps> {
  children?: any;
  style?: CSSProperties;
  className?: string;
}
/**
 * 给表单中的控件外围添加选中框
 * @param props 
 * @param ref 
 * @returns 
 */
function EditorSelection(props: EditorSelectionProps, ref: any) {
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
  const { selected } = useFormDesign();
  const selectedName = selected?.name;
  const isSelected = name ? name === selectedName && selected?.parent === parent : false;

  const addCol = () => {
    const nextIndex = (field?.index as number) + 1;
    const newField = currentPath && designer?.getItemByPath(currentPath);
    const addItem = isValidNumber(name) ? newField : { ...newField, name: defaultGetId(field?.id) }
    designer?.addItemByIndex(addItem, nextIndex, parent);
  }

  const deleteItem = () => {
    currentPath && designer?.delItemByPath(currentPath);
    setEdit({ selected: {} })
  }

  const chooseItem = (e: any) => {
    e.stopPropagation();
    console.log(name, props)
    setEdit({
      selected: {
        name: name as string,
        parent: parent,
        formparent: formparent,
        field: field
      }
    })
  }

  const prefixCls = "row-selection";

  const cls = classnames(prefixCls, className, {
    [`${prefixCls}-active`]: isSelected,
  });

  const Tool = (
    <div className='selection-tools'>
      <Icon name="add" onClick={addCol} />
      <Icon name="shanchu" onClick={deleteItem} />
    </div>
  );

  return (
    <div ref={ref} className={cls} style={style} onClick={chooseItem} {...restProps}>
      {isSelected ? Tool : null}
      {children}
    </div>
  );
};

export default React.forwardRef(EditorSelection);
