import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import RenderForm, { getCurrentPath, RenderFormProps } from '../../form-render';
import './index.less';
import EditorDnd from './dnd';
import EditorSelection from './selection';
import { DesignprefixCls } from '../provider';
import { useFormDesign, useFormEdit } from '../../utils/hooks';

export interface DesignEditorProps {
  className?: string
  style?: CSSProperties
}
const prefixCls = `${DesignprefixCls}-editor`;

function DesignEditor(props: DesignEditorProps, ref: any) {

  const { designer, designerForm, settingsForm, properties } = useFormDesign();
  const setEdit = useFormEdit();

  const {
    style,
    className,
    ...restProps
  } = props;

  const cls = classnames(prefixCls, className);

  const onPropertiesChange: RenderFormProps['onPropertiesChange'] = (newData) => {
    setEdit({ properties: newData })
  }

  // 编辑区域改动值
  const onFieldsChange: RenderFormProps['onFieldsChange'] = ({ parent, name, value }) => {
    const path = getCurrentPath(name, parent);
    // 回填setting表单的intialValue选项
    settingsForm?.setFieldValue('initialValue', value);
    // 回填designer的initialValue值
    path && designer?.updateItemByPath(path, { initialValue: value });
  }

  return (
    <div
      ref={ref}
      className={cls}
      style={style}
      {...restProps}
      onClick={() => {
        setEdit({ selected: { name: '#' } })
      }}>
      <RenderForm
        store={designer}
        form={designerForm}
        properties={properties}
        onPropertiesChange={onPropertiesChange}
        onFieldsChange={onFieldsChange}
        inside={EditorDnd}
        renderItem={renderItem}
      />
    </div>
  );
};

// 编辑区默认的选中框渲染
const renderItem: RenderFormProps['renderList'] = (params) => {
  const { children, parent } = params;
  const isRoot = !parent;
  if (isRoot) {
    return (
      <EditorSelection {...params} />
    );
  }
  return children;
}

DesignEditor.displayName = 'design-editor';
export default React.forwardRef(DesignEditor);