import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import { message } from 'antd';
import './index.less';
import { getConfigItem, getSelectedIndex, insertDesignItem } from '../../utils/utils';
import { ELementProps } from '../../form-render/configs';
import { DesignprefixCls } from '../provider';
import { useFormDesign } from '../../utils/hooks';
import DndSortable from '@/components/react-dragger-sort';
import { DndType } from '../editor/dnd';
import Tag from './tag';
import { pickObject } from '@/utils/object';

export interface DesignComponentsProps {
  className?: string
  style?: CSSProperties
}

const prefixCls = `${DesignprefixCls}-components`;
function DesignComponents(props: DesignComponentsProps, ref: any) {
  const {
    style,
    className,
  } = props;

  const { selected, designer, components, settings } = useFormDesign();
  const selectedParent = selected?.parent;
  const attributeName = selected?.attributeName;
  const cls = classnames(prefixCls, className);

  const onChange = (key: string, item: ELementProps) => {
    if (attributeName) return;
    const newIndex = getSelectedIndex(selected) + 1; // 插入位置序号
    const initialField = getConfigItem(key, components, settings); // 插入的属性类型
    const includesIds = selectedParent?.field?.includes;
    if (includesIds && !includesIds.includes(key)) {
      message.warning("当前不可插入")
      return;
    };
    insertDesignItem(designer, initialField, newIndex, { path: selectedParent?.path });
  }

  const componentData = {
    '布局组件': pickObject(components, ['GridRow', 'Divider', 'Alert']),
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
    ])
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
                collection={{ type: DndType.Components }}
                options={{
                  disabledDrop: true,
                  hiddenFrom: false,
                  disabledSort: true
                }}
              >
                {
                  Object.entries(configs || {})?.map(([key, data]) => {
                    return <Tag key={key} data-id={key} icon={data?.configIcon} onChange={() => onChange?.(key, data)}>{data?.configLabel}</Tag>
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

DesignComponents.displayName = 'design-components';
export default React.forwardRef(DesignComponents);
