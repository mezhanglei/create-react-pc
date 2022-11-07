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

  const { designer, properties, selected, settingsForm } = useContext(FormRenderContext);
  const setEdit = useContext(FormEditContext);

  const {
    style,
    className,
    ...restProps
  } = props;

  const cls = classnames(prefixCls, className);

  const onPropertiesChange: RenderFormProps['onPropertiesChange'] = (newData) => {
    setEdit({ properties: newData });
  }

  // 表单属性更改时回填属性初始值设置
  const onFieldsChange: RenderFormProps['onFieldsChange'] = ({ parent, name, value }) => {
    const path = getCurrentPath(name, parent)
    // 回填setting表单的intialValue值
    settingsForm.setInitialValues('initialValue', value);
    // 回填designer的initialValue值
    designer?.updateItemByPath(path, { initialValue: value });
  }

  const renderItem: BaseRenderProps['renderItem'] = (params) => {
    const { field } = params;
    // 针对控件组件统一添加
    if (!field?.properties) {
      return <FormItemWrapper {...params} />
    }
    return params?.children
  }

  const renderList: BaseRenderProps['renderList'] = (params) => {
    return <FormDnd {...params} />
  }

  return (
    <div ref={ref}
      className={cls}
      style={style}
      {...restProps}
      onClick={() => {
        setEdit({ selected: "#" })
      }}>
      <RenderForm
        store={designer}
        properties={properties}
        onPropertiesChange={onPropertiesChange}
        onFieldsChange={onFieldsChange}
        renderItem={renderItem}
        renderList={renderList}
      />
    </div>
  );
};

DesignViewer.displayName = 'design-viewer';
export default React.forwardRef(DesignViewer);
