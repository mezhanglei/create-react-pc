import React, { CSSProperties, useContext, useEffect, useState } from 'react'
import classnames from 'classnames';
import RenderForm, { RenderFormProps, useFormRenderStore } from '../form-render';
import { FormEditContext, FormRenderContext } from '../design-context';
import { updateSelectedValues, getSelectedValues } from '../utils/utils';
import { changePathEnd, endIsListItem } from '@/components/react-easy-formrender/utils/utils';

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
    const lastValues = getSelectedValues(viewerRenderStore, selected, newSettings);
    form?.reset(lastValues);
    setSettingSchema({ properties: newSettings });
    setEdit({ settingsForm: form });
    updateSelectedValues(viewerRenderStore, selected, lastValues);
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
    updateSelectedValues(viewerRenderStore, selected, settingsValues);
    // 如果更改字段名
    const { name } = settingsValues;
    if (name) {
      const newSelected = changePathEnd(selected, name);
      setEdit({ selected: newSelected });
    }
  }

  return (
    <div ref={ref} className={cls} style={style}>
      <RenderForm store={form} schema={settingSchema} layout="vertical" onFieldsChange={onFieldsChange} />
    </div>
  );
};

SelectedSettings.displayName = 'selected-settings';
export default React.forwardRef(SelectedSettings);
