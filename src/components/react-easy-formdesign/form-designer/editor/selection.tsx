import { getCurrentPath, isListIndex } from '@/components/react-easy-formcore';
import { defaultGetId } from '../../utils/utils';
import classnames from 'classnames';
import React, { CSSProperties } from 'react';
import { GeneratePrams } from '../../form-render';
import './selection.less';
import { ELementProps } from '../components/configs';
import { useFormDesign, useFormEdit } from '../../utils/hooks';

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
    field,
    store: designer,
    form: designerForm,
    ...restProps
  } = props;

  const currentPath = getCurrentPath(name, parent) as string;
  const { selected } = useFormDesign();
  const setEdit = useFormEdit();
  const selectedName = selected?.name;
  const isSelected = name ? name === selectedName && selected?.parent === parent : false;
  const copyItem = () => {
    const nextIndex = (field?.index as number) + 1;
    const newField = designer?.getItemByPath(currentPath);
    const addItem = isListIndex(name) ? newField : { ...newField, name: defaultGetId(field?.id) }
    designer?.addItemByIndex(addItem, nextIndex, parent);
  }

  const deleteItem = () => {
    designer?.delItemByPath(currentPath);
    setEdit({ selected: {} })
  }

  const chooseItem = (e: any) => {
    e.stopPropagation();
    setEdit({
      selected: {
        name: name as string,
        parent: parent,
        field: field
      }
    })
  }

  const prefixCls = "editor-selection";

  const cls = classnames(prefixCls, className, {
    [`${prefixCls}-active`]: isSelected
  });

  const Tool = (
    <div className='selection-tools'>
      <i className='iconfont icon-fuzhi' onClick={copyItem} />
      <i className='iconfont icon-shanchu' onClick={deleteItem} />
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
