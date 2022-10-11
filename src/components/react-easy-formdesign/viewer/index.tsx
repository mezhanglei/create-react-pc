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

  const onFieldsChange: RenderFormProps['onFieldsChange'] = ({ parent, name, value }) => {
    if (!selected || selected === '#' || !settingsForm) return;
    const path = getCurrentPath(name, parent)
    updateViewerValue(path, value);
  }

  const viewerClick = () => {
    setEdit({ selected: "#" });
  }

  const updateViewerValue = (path: string | undefined, value: unknown) => {
    settingsForm.setInitialValues('initialValue', value);
    viewerRenderStore?.updateItemByPath(path, { initialValue: value });
  }

  return (
    <div ref={ref} className={cls} style={style} {...restProps} onClick={viewerClick}>
      <RenderForm store={viewerRenderStore} schema={schema}
        onSchemaChange={onSchemaChange}
        onFieldsChange={onFieldsChange}
        renderItem={FormItemWrapper}
        renderList={FormDnd}
      />
    </div>
  );
};

DesignViewer.displayName = 'design-viewer';
export default React.forwardRef(DesignViewer);
