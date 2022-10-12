import React, { useContext, CSSProperties } from 'react'
import classnames from 'classnames';
import RenderForm, { BaseRenderProps, getCurrentPath, RenderFormProps } from '../form-render';
import { FormEditContext, FormRenderContext } from '../design-context';
import FormItemWrapper from './form-item-wrapper';
import './index.less';
import FormDnd from './form-dnd'

export interface DesignViewerProps {
  className?: string
  style?: CSSProperties
}
const prefixCls = 'easy-form-design-viewer';

function DesignViewer(props: DesignViewerProps, ref: any) {

  const { viewerRenderStore, schema, selected, settingsForm } = useContext(FormRenderContext);
  const setEdit = useContext(FormEditContext);

  const {
    style,
    className,
    ...restProps
  } = props;

  const cls = classnames(prefixCls, className);

  const onSchemaChange: RenderFormProps['onSchemaChange'] = (newSchema) => {
    setEdit({ schema: newSchema });
  }

  // 表单属性更改时回填属性初始值设置
  const onFieldsChange: RenderFormProps['onFieldsChange'] = ({ parent, name, value }) => {
    if (!selected || selected === '#' || !settingsForm) return;
    const path = getCurrentPath(name, parent)
    updateViewerValue(path, value);
  }

  const viewerClick = () => {
    setEdit({ selected: "#" });
  }

  // 回填属性表单和编辑器的initialValue
  const updateViewerValue = (path: string | undefined, value: unknown) => {
    settingsForm.setInitialValues('initialValue', value);
    viewerRenderStore?.updateItemByPath(path, { initialValue: value });
  }

  return (
    <div ref={ref} className={cls} style={style} {...restProps} onClick={viewerClick}>
      <RenderForm store={viewerRenderStore} schema={schema}
        onSchemaChange={onSchemaChange}
        onFieldsChange={onFieldsChange}
        renderItem={renderItem}
        renderList={FormDnd}
      />
    </div>
  );
};

const renderItem: BaseRenderProps['renderItem'] = (props) => {
  const { field } = props;
  // 针对控件组件统一添加
  if (!field?.properties) {
    return <FormItemWrapper {...props} />
  }
  return props?.children
}

DesignViewer.displayName = 'design-viewer';
export default React.forwardRef(DesignViewer);
