import { joinFormPath } from '@/components/react-easy-formcore';
import { insertDesignItem, isIgnoreName } from '../../utils/utils';
import classnames from 'classnames';
import React, { CSSProperties } from 'react';
import { GeneratePrams } from '../../form-render';
import './selection.less';
import { ELementProps } from '../components/configs';
import { useFormDesign, useFormEdit } from '../../utils/hooks';
import { isEmpty } from '@/utils/type';
import Icon from '@/components/svg-icon';

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
  const { selected, selectedPath } = useFormDesign();
  const selectedName = selected?.name;
  const isSelected = name ? name === selectedName && selected?.parent === parent : false;
  
  const copyItem = () => {
    const nextIndex = (field?.index as number) + 1;
    const isIgnoreItem = isIgnoreName(selectedPath);
    const newField = currentPath && designer?.getItemByPath(currentPath);
    designer && insertDesignItem(designer, newField, nextIndex, parent, isIgnoreItem);
  }

  const deleteItem = () => {
    currentPath && designer?.delItemByPath(currentPath);
    setEdit({ selected: {} })
  }

  const chooseItem = (e: any) => {
    e.stopPropagation();
    setEdit({
      selected: {
        name: name as string,
        parent: parent,
        formparent: formparent,
        field: field
      }
    })
  }

  const prefixCls = "control-selection";

  const cls = classnames(prefixCls, className, {
    [`${prefixCls}-active`]: isSelected,
  });

  const classes = {
    mask: `${prefixCls}-mask`
  }

  const Tool = (
    <div className='selection-tools'>
      <Icon name="fuzhi" onClick={copyItem} />
      <Icon name="shanchu" onClick={deleteItem} />
    </div>
  );

  return (
    <div ref={ref} className={cls} style={style} onClick={chooseItem} {...restProps}>
      {isSelected ? Tool : null}
      {children}
      {field?.editMask && <div className={classes.mask}></div>}
    </div>
  );
};

export default React.forwardRef(EditorSelection);
