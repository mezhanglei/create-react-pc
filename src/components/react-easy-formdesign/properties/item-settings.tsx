import React, { CSSProperties, useContext, useEffect, useState } from 'react'
import classnames from 'classnames';
import RenderForm, { RenderFormProps, useFormRenderStore } from '../form-render';
import { FormEditContext, FormRenderContext } from '../design-context';
import { allElements, ELementProps } from '../config';
import { commonSettings, nameSettings } from '../config/common-settings';
import { changeSelected, getPathEnd, endIsListItem } from '../utils/utils';

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
  const { formRenderStore, selected, selectedType } = useContext(FormRenderContext);
  const setEdit = useContext(FormEditContext);
  const form = useFormRenderStore();

  const [settingSchema, setSettingSchema] = useState({});

  const cls = classnames(prefixCls, className);

  useEffect(() => {
    if (!selected || selected === '#') return;
    const itemSettings = allElements[selectedType]?.['settings'];
    const newSettings = createSettings(selected, itemSettings, commonSettings)
    const lastFormValues = formRenderStore.getItemByPath(selected);
    // const defaultFormValues = form.getFieldValue();
    if (!endIsListItem(selected)) {
      lastFormValues['name'] = getPathEnd(selected);
    }
    form?.reset(lastFormValues);
    setSettingSchema({ properties: newSettings });
  }, [selected]);

  // 生成当前控件的settings
  const createSettings = (selected: string, item: ELementProps['settings'], common: ELementProps['settings']) => {
    let baseSettings = { ...item, ...common };
    // 非数组项添加字段名编辑控件
    if (!endIsListItem(selected)) {
      baseSettings = { ...nameSettings, ...baseSettings }
    }
    return baseSettings;
  }

  const onFieldsChange: RenderFormProps['onFieldsChange'] = () => {
    if (!selected) return;
    const formValues = form.getFieldValue();
    formRenderStore?.setInitialValues(selected, formValues?.initialValue); // 更新控件的值
    formRenderStore?.updateItemByPath(selected, formValues); // 更新控件的属性
    if (formValues?.name) {
      const newSelected = changeSelected(selected, formValues?.name);
      setEdit({ selected: newSelected });
    }
  }

  return (
    <div ref={ref} className={cls} style={style}>
      <RenderForm store={form} schema={settingSchema} layout="vertical" onFieldsChange={onFieldsChange} />
    </div>
  );
};

ItemSettings.displayName = 'item-settings';
export default React.forwardRef(ItemSettings);
