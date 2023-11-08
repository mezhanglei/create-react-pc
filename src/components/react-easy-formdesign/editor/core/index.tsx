import React, { CSSProperties, useState } from 'react';
import classnames from 'classnames';
import RenderForm, { RenderFormProps } from '../../render';
import './index.less';
import RootDnd from './RootDnd';
import ComponentSelection from './selection';
import Tooltip from '@/components/tooltip';
import Icon from "@/components/SvgIcon";
import { Button, Divider, Radio } from 'antd';
import PlatContainer, { PlatContainerProps, PlatOptions } from './platContainer';
import { ImportModalProps, showImportModal } from './importModal';
import { showPreviewModal } from './preview';
import { showExportJsonModal } from './exportJson';
import { updateEditorFormItem } from '../../render/utils/utils';
import { useFormEditor, useEventBusRef } from '../hooks';

export interface EditorCoreProps {
  className?: string;
  style?: CSSProperties;
}
const prefixCls = `easy-form-editor`;

function EditorCore(props: EditorCoreProps, ref: any) {

  const editorContext = useFormEditor();
  const { setContextValue, editor, editorForm, settingForm, properties } = editorContext;

  const {
    style,
    className,
    ...restProps
  } = props;

  const cls = classnames(prefixCls, className);
  const [platType, setPlatType] = useState<PlatContainerProps['plat']>('pc');
  const [templates, setTemplates] = useState<ImportModalProps['data']>([]);
  const selectedRef = useEventBusRef('choose');

  const onPropertiesChange: RenderFormProps['onPropertiesChange'] = (newData) => {
    console.log(newData, '表单')
    setContextValue({ properties: newData });
  }

  // 监听选中项改动
  const onFieldsChange: RenderFormProps['onFieldsChange'] = ({ name, value }) => {
    setTimeout(() => {
      // 表单值保存在initialValue字段
      const selected = selectedRef.current;
      updateEditorFormItem(editor, { initialValue: value }, selected?.path, selected?.attributeName);
      // 回填setting表单的intialValue选项
      settingForm?.setFieldValue('initialValue', value);
    }, 0);
  }

  const importJson = () => {
    showImportModal()
  }

  const showPreview = () => {
    showPreviewModal({ properties, plat: platType });
  }
  const clearEditor = () => {
    setContextValue({ properties: undefined });
  }
  const showExportJson = () => {
    showExportJsonModal({ data: properties, title: '渲染JSON' });
  }

  return (
    <div
      ref={ref}
      className={cls}
      style={style}
      {...restProps}
      onClick={() => {
      }}>
      <header className="editor-header">
        <div className="left-toolbar">
          {/* <Tooltip
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
          <Divider className="left-divid" type='vertical' /> */}
          <Radio.Group
            options={PlatOptions}
            onChange={(e) => setPlatType(e?.target?.value)}
            value={platType}
            optionType="button"
            buttonStyle="solid"
          />
        </div>
        <Button type='link' disabled={templates?.length ? false : true} onClick={importJson}>导入模板</Button>
        <Button type='link' onClick={showPreview}>预览</Button>
        <Button type='link' onClick={clearEditor}>清空</Button>
        <Button type='link' onClick={showExportJson}>生成JSON</Button>
      </header>
      <main className="editor-main">
        <PlatContainer plat={platType}>
          <RenderForm
            options={{ isEditor: true, context: editorContext }}
            formrender={editor}
            form={editorForm}
            properties={properties}
            onPropertiesChange={onPropertiesChange}
            onFieldsChange={onFieldsChange}
            inside={RootDnd}
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

EditorCore.displayName = 'editor-core';
export default React.forwardRef(EditorCore);
