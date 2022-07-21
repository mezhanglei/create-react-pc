import React, { CSSProperties, useContext, useEffect, useState } from 'react'
import classnames from 'classnames';
import RenderForm, { RenderFormProps, useFormRenderStore } from '../form-render';
import { FormEditContext, FormRenderContext } from '../design-context';
import { allElements, ELementProps } from '../config';
import { commonSettings, nameSettings } from '../config/common-settings';
import { changeSelected, getPathEnd, endIsListItem } from '../utils/utils';
import { getInitialValues } from '@/components/react-easy-formrender/utils/utils';

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
  const { viewerRenderStore, selected, selectedType } = useContext(FormRenderContext);
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
    const { name, ...rest } = lastValues;
    viewerRenderStore?.updateItemByPath(selected, rest);
  }, [selected]);

  // 生成当前控件的settings
  const createSettings = (selected: string) => {
    const itemSettings = allElements[selectedType]?.['settings'];
    let baseSettings = { ...itemSettings, ...commonSettings };
    // 非数组项添加字段名编辑控件
    if (!endIsListItem(selected)) {
      baseSettings = { ...nameSettings, ...baseSettings }
    }
    return baseSettings;
  }

  const onFieldsChange: RenderFormProps['onFieldsChange'] = () => {
    if (!selected) return;
    const settingsValues = form.getFieldValue();
    const { name, ...rest } = settingsValues;
    viewerRenderStore?.setInitialValues(selected, rest?.initialValue); // 更新控件的值
    viewerRenderStore?.updateItemByPath(selected, rest); // 更新控件的属性
    if (name) {
      const newSelected = changeSelected(selected, name);
      viewerRenderStore?.updateNameByPath(selected, name);
      setEdit({ selected: newSelected });
    }
  }

  // 当前控件的缓存属性
  const getLastValues = (selected: string, curSettings: ELementProps['settings']) => {
    const viewerValues = viewerRenderStore.getItemByPath(selected);
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
