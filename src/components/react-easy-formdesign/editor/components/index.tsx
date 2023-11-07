import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import { message } from 'antd';
import './index.less';
import { getConfigItem, getSelectedIndex, insertEditorFormItem } from '../../render/utils/utils';
import DndSortable from '@/components/react-dragger-sort';
import Tag from './tag';
import { pickObject } from '@/utils/object';
import { ELementProps } from '../../render/components';
import { useFormEditor } from '../hooks';

export interface EditorComponentsProps {
  className?: string
  style?: CSSProperties
}

const prefixCls = `easy-form-components`;
function EditorComponents(props: EditorComponentsProps, ref: any) {
  const {
    style,
    className,
  } = props;

  const { selected, editor, components, settings } = useFormEditor();
  const selectedParent = selected?.parent;
  const attributeName = selected?.attributeName;
  const cls = classnames(prefixCls, className);

  const onChange = (key: string, item: ELementProps) => {
    if (attributeName) return;
    const newIndex = getSelectedIndex(editor, selected) + 1; // 插入位置序号
    const initialField = getConfigItem(key, components, settings); // 提取默认值
    const configInfo = selectedParent?.field?.configInfo;
    const includesIds = configInfo?.includes;
    if (includesIds && !includesIds.includes(key)) {
      message.warning("当前不可插入")
      return;
    };
    insertEditorFormItem(editor, initialField, newIndex, { path: selectedParent?.path });
  }

  const componentData = {
    '布局组件': pickObject(components, ['Grid', 'Divider', 'Alert']),
    '控件组合': pickObject(components, ['FormTable']),
    '基础控件': pickObject(components, [
      "Input",
      "RadioGroup",
      "CheckboxGroup",
      "Select",
      "Switch",
      "TimePicker",
      "TimePickerRangePicker",
      "DatePicker",
      "DatePickerRangePicker",
      "Slider",
      "Rate",
      "ColorPicker",
      "Cascader",
      "FileUpload",
      "ImageUpload",
      "RichEditor",
      "RichText",
    ]),
    '业务组件': pickObject(components, ['example'])
  }

  return (
    <div ref={ref} className={cls} style={style}>
      {
        Object.entries(componentData).map(([title, configs]) => {
          return (
            <div key={title} className='components-list'>
              <div className={`components-list-title`}>{title}</div>
              <DndSortable
                className='elements-list'
                collection={{ type: 'components' }}
                options={{
                  disabledDrop: true,
                  hiddenFrom: false,
                  disabledSort: true
                }}
              >
                {
                  Object.entries(configs || {})?.map(([key, data]) => {
                    const configInfo = data?.configInfo || {};
                    return <Tag key={key} data-id={key} icon={configInfo?.icon} onChange={() => onChange?.(key, data)}>{configInfo.label}</Tag>
                  })
                }
              </DndSortable>
            </div>
          )
        })
      }
    </div>
  );
};

EditorComponents.displayName = 'editor-components';
export default React.forwardRef(EditorComponents);
