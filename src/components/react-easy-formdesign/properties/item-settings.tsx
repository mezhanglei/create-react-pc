import React, { CSSProperties, useContext, useEffect, useState } from 'react'
import classnames from 'classnames';
import RenderForm, { RenderFormProps, useFormRenderStore } from '../form-render';
import { FormEditContext, FormRenderContext } from '../design-context';
import { ELementProps } from '../config';
import { fieldSettings } from '../config/field-settings';
import { changeSelected, getPathEnd, endIsListItem } from '../utils/utils';
import { getInitialValues } from '@/components/react-easy-formrender/utils/utils';
import { FieldProps } from '@/components/react-easy-formcore';
import { getContainerSettings } from '../config/container-settings';

export interface ItemSettingsProps {
  className?: string
  style?: CSSProperties
}
const prefixCls = 'item-settings';
function ItemSettings(props: ItemSettingsProps, ref: any) {
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

  // 生成当前控件的settings
  const createSettings = (selected: string) => {
    const selectedItem = viewerRenderStore.getItemByPath(selected);
    const originSettings = selectedItem?.['settings'];
    let baseSettings = { ...originSettings };
    // 当有outside属性时则添加对应的配置
    if (selectedItem?.outside?.type) {
      baseSettings = {
        ...baseSettings,
        outside: getContainerSettings(selectedItem?.outside?.type)
      }
    }
    // TODO：只有表单域组件才可以添加表单域的属性
    if (selectedItem?.category !== 'container') {
      baseSettings = {
        ...baseSettings,
        ...fieldSettings
      }
    }
    // 非数组项添加字段名编辑控件
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

  // 获取旧值
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

ItemSettings.displayName = 'item-settings';
export default React.forwardRef(ItemSettings);
