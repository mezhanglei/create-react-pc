import { insertEditorFormItem } from '../../form-render/utils/utils';
import React, { CSSProperties } from 'react';
import Icon from '@/components/SvgIcon';
import BaseSelection, { CommonSelectionProps } from '../../form-render/components/BaseSelection';

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
    formrender: editor,
    form: editorForm,
  } = props;

  const currentPath = path;

  const copyItem = () => {
    const nextIndex = (field?.index as number) + 1;
    const newField = currentPath && editor?.getItemByPath(currentPath);
    editor && insertEditorFormItem(editor, newField, nextIndex, { path: parent?.path });
  }

  const deleteItem = (e) => {
    e.stopPropagation();
    currentPath && editor?.delItemByPath(currentPath);
  }

  return (
    <BaseSelection
      ref={ref}
      {...props}
      configLabel={field?.configInfo?.label}
      tools={[<Icon key="fuzhi" name="fuzhi" onClick={copyItem} />, <Icon key="shanchu" name="shanchu" onClick={deleteItem} />]}
    >
      {children}
    </BaseSelection>
  );
};

export default React.forwardRef(ControlSelection);