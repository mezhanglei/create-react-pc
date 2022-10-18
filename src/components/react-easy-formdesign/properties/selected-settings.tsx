import React, { CSSProperties, useContext, useEffect, useState } from 'react'
import classnames from 'classnames';
import RenderForm, { RenderFormProps, useFormRenderStore } from '../form-render';
import { FormEditContext, FormRenderContext } from '../design-context';
import { ELementProps } from '../config';
import { changeSelected, getPathEnd, endIsListItem } from '../utils/utils';
import { getInitialValues } from '@/components/react-easy-formrender/utils/utils';
import { FieldProps } from '@/components/react-easy-formcore';

export interface SelectedSettingsProps {
  className?: string
  style?: CSSProperties
}
const prefixCls = 'item-settings';

// 选中节点的属性设置
function SelectedSettings(props: SelectedSettingsProps, ref: any) {
  const {
    style,
    className
  } = props;
  const { viewerRenderStore, selected } = useContext(FormRenderContext);
  const setEdit = useContext(FormEditContext);
  const form = useFormRenderStore();

  const [settingSchema, setSettingSchema] = useState({});

  const cls = classnames(prefixCls, className);

  useEffect(() => {
    if (!selected || selected === '#') return;
    const newSettings = createSettings(selected);
    const lastValues = getLastValues(selected, newSettings);
    form?.reset(lastValues);
    setSettingSchema({ properties: newSettings });
    setEdit({ settingsForm: form });
    // 同步属性到viewer组件
    updateViewer(lastValues);
  }, [selected]);

  // 生成当前节点的settings
  const createSettings = (selected: string) => {
    const selectedItem = viewerRenderStore.getItemByPath(selected);
    const originSettings = selectedItem?.['settings'];
    let baseSettings = { ...originSettings };
    // TODO：是否所有的表单节点都设置此属性
    if (!endIsListItem(selected)) {
      baseSettings = {
        name: {
          label: '字段名',
          type: 'Input'
        },
        ...baseSettings
      };
    }
    return baseSettings;
  }

  const onFieldsChange: RenderFormProps['onFieldsChange'] = () => {
    if (!selected) return;
    const settingsValues = form.getFieldValue();
    updateViewer(settingsValues);
    const { name } = settingsValues;
    if (name) {
      const newSelected = changeSelected(selected, name);
      viewerRenderStore?.updateNameByPath(selected, name);
      setEdit({ selected: newSelected });
    }
  }

  // 更新viewer组件
  const updateViewer = (settingValues: FieldProps) => {
    const { name, ...field } = settingValues || {};
    viewerRenderStore?.setInitialValues(selected, field?.initialValue); // 更新控件的值
    viewerRenderStore?.updateItemByPath(selected, field); // 更新控件的属性
  }

  // 获取当前节点的上一次设置的值
  const getLastValues = (selected: string, curSettings: ELementProps['settings']) => {
    const viewerValues = viewerRenderStore.getItemByPath(selected) || {};
    if (!endIsListItem(selected)) {
      viewerValues['name'] = getPathEnd(selected);
    }
    const initialValues = getInitialValues(curSettings);
    const lastValues = { ...initialValues, ...viewerValues };
    return lastValues;
  }

  return (
    <div ref={ref} className={cls} style={style}>
      <RenderForm store={form} schema={settingSchema} layout="vertical" onFieldsChange={onFieldsChange} />
    </div>
  );
};

SelectedSettings.displayName = 'selected-settings';
export default React.forwardRef(SelectedSettings);
