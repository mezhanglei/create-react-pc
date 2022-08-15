import React, { useContext, CSSProperties } from 'react'
import classnames from 'classnames';
import RenderForm, { RenderFormProps } from '../form-render';
import { FormEditContext, FormRenderContext } from '../design-context';
import RenderItem from './render-item';
import './index.less';
import RenderList from './render-list';

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

  const onFieldsChange: RenderFormProps['onFieldsChange'] = ({ path, value }) => {
    if (!selected || selected === '#' || !settingsForm) return;
    updateViewerValue(path, value);
  }

  const viewerClick = () => {
    setEdit({ selected: "#" });
  }

  const updateViewerValue = (path: string, value: unknown) => {
    settingsForm.setInitialValues('initialValue', value);
    viewerRenderStore?.updateItemByPath(path, { initialValue: value });
  }

  return (
    <div ref={ref} className={cls} style={style} {...restProps} onClick={viewerClick}>
      <RenderForm store={viewerRenderStore} schema={schema}
        onSchemaChange={onSchemaChange}
        onFieldsChange={onFieldsChange}
        renderItem={RenderItem}
        renderList={RenderList}
      />
    </div>
  );
};

DesignViewer.displayName = 'design-viewer';
export default React.forwardRef(DesignViewer);
