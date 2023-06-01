import React, { CSSProperties, useState } from 'react';
import classnames from 'classnames';
import RenderForm, { RenderFormProps } from '../../form-render';
import './index.less';
import ControlDnd from './dnd';
import ComponentSelection from './selection';
import { DesignprefixCls } from '../provider';
import { useFormDesign, useFormEdit } from '../../utils/hooks';
import Tooltip from '@/components/tooltip';
import Icon from "@/components/svg-icon";
import { Button, Divider, Radio } from 'antd';
import PlatContainer, { PlatContainerProps } from './platContainer';
import { showImportModal } from './importModal';
import { showPreviewModal } from './preview';
import { showExportJsonModal } from './exportJson';
import { updateDesignerItem } from '../../utils/utils';

export interface DesignEditorProps {
  className?: string
  style?: CSSProperties
}
const prefixCls = `${DesignprefixCls}-editor`;

function DesignEditor(props: DesignEditorProps, ref: any) {

  const { designer, designerForm, settingsForm, selected, properties } = useFormDesign();
  const setEdit = useFormEdit();

  const {
    style,
    className,
    ...restProps
  } = props;

  const cls = classnames(prefixCls, className);
  const [plat, setPlat] = useState<PlatContainerProps['plat']>('pc');
  const PlatOptions = [
    { label: 'PC', value: 'pc' },
    { label: 'Pad', value: 'pad' },
    { label: 'Phone', value: 'phone' }
  ];
  const onPropertiesChange: RenderFormProps['onPropertiesChange'] = (newData) => {
    console.log(newData, '表单')
    setEdit({ properties: newData });
  }

  // 监听选中项改动
  const onFieldsChange: RenderFormProps['onFieldsChange'] = ({ value }) => {
    // 回填setting表单的intialValue选项
    settingsForm?.setFieldValue('initialValue', value);
    // 表单记录下新的initialValue值
    updateDesignerItem(designer, { initialValue: value }, selected?.path, selected?.attributeName);
  }

  const importJson = () => {
    showImportModal()
  }
  const showPreview = () => {
    showPreviewModal({ properties })
  }
  const clearEditor = () => {
    setEdit({ properties: undefined });
  }
  const showExportJson = () => {
    showExportJsonModal({ properties });
  }

  return (
    <div
      ref={ref}
      className={cls}
      style={style}
      {...restProps}
      onClick={() => {
        setEdit({ selected: { name: '#' } });
      }}>
      <header className="editor-header">
        <div className="left-toolbar">
          <Tooltip
            appendTo={document.body}
            theme="light"
            content="撤销"
          >
            <Button className="undo-btn" type='link'>
              <Icon name="undo" />
            </Button>
          </Tooltip>
          <Tooltip
            appendTo={document.body}
            theme="light"
            content="重做"
          >
            <Button className="redo-btn" type='link'>
              <Icon name="redo" />
            </Button>
          </Tooltip>
          <Divider className="left-divid" type='vertical' />
          <Radio.Group
            className="plat-buttons"
            options={PlatOptions}
            onChange={(e) => setPlat(e?.target?.value)}
            value={plat}
            optionType="button"
            buttonStyle="solid"
          />
        </div>
        <Button type='link' onClick={importJson}>导入模板</Button>
        <Button type='link' onClick={showPreview}>预览</Button>
        <Button type='link' onClick={clearEditor}>清空</Button>
        <Button type='link' onClick={showExportJson}>生成JSON</Button>
      </header>
      <main className="editor-main">
        <PlatContainer plat={plat}>
          <RenderForm
            isEditor
            formrender={designer}
            form={designerForm}
            properties={properties}
            onPropertiesChange={onPropertiesChange}
            onFieldsChange={onFieldsChange}
            inside={ControlDnd}
            renderItem={renderItem}
          />
        </PlatContainer>
      </main>
    </div>
  );
};

// 编辑区默认的选中框渲染
const renderItem: RenderFormProps['renderItem'] = (params) => {
  const { children } = params;
  const isControl = params?.field?.properties ? false : true;
  // 只有输入控件才需要默认添加选区
  if (isControl) {
    return <ComponentSelection {...params} data-type="ignore" />
  }
  return children;
}

DesignEditor.displayName = 'design-editor';
export default React.forwardRef(DesignEditor);
