import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import RenderForm, { getCurrentPath, RenderFormProps } from '../../form-render';
import FormItemWrapper, { FormItemWrapperProps } from './form-item-wrapper';
import './index.less';
import EditorDnd from './editor-dnd';
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

  // 表单属性更改时回填属性初始值设置
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

const renderItem = (params: FormItemWrapperProps) => {
  const { field } = params;
  // 针对
  if (!field?.properties) {
    return <FormItemWrapper {...params} />
  }
  return params?.children
}

DesignEditor.displayName = 'design-editor';
export default React.forwardRef(DesignEditor);
