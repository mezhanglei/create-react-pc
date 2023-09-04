import React from 'react';
import Icon from '@/components/SvgIcon';
import { insertDesignItem } from '@/components/react-easy-formdesign/utils/utils';
import BaseSelection, { CommonSelectionProps } from '@/components/react-easy-formdesign/form-designer/editor/baseSelection';
import classnames from 'classnames';
import './col-selection.less';

export interface ColSelectionProps extends CommonSelectionProps {
}
/**
 * 给表单中的控件外围添加选中框
 * @param props 
 * @param ref 
 * @returns 
 */
function ColSelection(props: ColSelectionProps, ref: any) {
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

  const addCol = () => {
    const nextIndex = (field?.index as number) + 1;
    const newField = {
      type: 'Grid.Col',
      props: { span: 12 },
      ignore: true,
      properties: {
      }
    };
    designer && insertDesignItem(designer, newField, nextIndex, { path: parent?.path });
  }

  const deleteItem = () => {
    currentPath && designer?.delItemByPath(currentPath);
  }

  const prefixCls = "col-selection";
  const cls = classnames(prefixCls, className);

  return (
    <BaseSelection
      ref={ref}
      {...props}
      configLabel="栅格列"
      className={cls}
      tools={[<Icon key="add" name="add" onClick={addCol} />, <Icon key="shanchu" name="shanchu" onClick={deleteItem} />]}>
      {children}
    </BaseSelection>
  );
};

export default React.forwardRef(ColSelection);
