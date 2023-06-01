import { insertDesignItem } from '../../utils/utils';
import React, { CSSProperties } from 'react';
import { useFormEdit } from '../../utils/hooks';
import Icon from '@/components/svg-icon';
import BaseSelection, { CommonSelectionProps } from './baseSelection';

export interface ControlSelectionProps extends CommonSelectionProps {
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
function ControlSelection(props: ControlSelectionProps, ref: any) {
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

  const setEdit = useFormEdit();
  const currentPath = path;

  const copyItem = () => {
    const nextIndex = (field?.index as number) + 1;
    const newField = currentPath && designer?.getItemByPath(currentPath);
    designer && insertDesignItem(designer, newField, nextIndex, { path: parent?.path });
  }

  const deleteItem = () => {
    currentPath && designer?.delItemByPath(currentPath);
    setEdit({ selected: {} })
  }

  return (
    <BaseSelection
      ref={ref}
      {...props}
      componentLabel={field?.componentLabel}
      tools={[<Icon key="fuzhi" name="fuzhi" onClick={copyItem} />, <Icon key="shanchu" name="shanchu" onClick={deleteItem} />]}
    >
      {children}
    </BaseSelection>
  );
};

export default React.forwardRef(ControlSelection);
