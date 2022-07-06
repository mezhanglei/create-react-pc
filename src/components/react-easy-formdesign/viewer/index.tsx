import React, { useContext, CSSProperties } from 'react'
import classnames from 'classnames';
import RenderForm, { RenderFormProps } from '../form-render';
import { FormEditContext, FormRenderContext } from '../design-context';
import Wrapper from './wrapper';
import './index.less';
import DndList from './dnd-list';

export interface DesignViewerProps {
  className?: string
  style?: CSSProperties
}
const prefixCls = 'easy-form-design-viewer';

function DesignViewer(props: DesignViewerProps, ref: any) {

  const { formRenderStore, schema } = useContext(FormRenderContext);
  const setEdit = useContext(FormEditContext);

  const {
    style,
    className,
    ...restProps
  } = props;

  const cls = classnames(prefixCls, className)

  const onSchemaChange: RenderFormProps['onSchemaChange'] = (newSchema) => {
    setEdit({ schema: newSchema });
  }

  const viewerClick = () => {
    setEdit({ selected: undefined });
  }

  return (
    <div ref={ref} className={cls} style={style} {...restProps} onClick={viewerClick}>
      <RenderForm store={formRenderStore} schema={schema}
        customList={DndList}
        customInner={Wrapper}
        onSchemaChange={onSchemaChange}
      />
    </div>
  );
};

DesignViewer.displayName = 'design-viewer';
export default React.forwardRef(DesignViewer);
