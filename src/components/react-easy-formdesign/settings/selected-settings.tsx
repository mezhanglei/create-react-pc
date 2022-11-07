import React, { CSSProperties, useContext, useEffect, useState } from 'react'
import classnames from 'classnames';
import RenderForm, { RenderFormProps, useFormStore } from '../form-render';
import { FormEditContext, FormRenderContext } from '../design-context';
import { updateSelectedValues, getSelectedValues, isNoSelected, getSelectedSettings } from '../utils/utils';
import { changePathEnd } from '@/components/react-easy-formrender/utils/utils';

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
  const { designer, selected } = useContext(FormRenderContext);
  const setEdit = useContext(FormEditContext);
  const form = useFormStore();

  const [settingProperties, setSettingProperties] = useState({});

  const cls = classnames(prefixCls, className);

  useEffect(() => {
    // 根据selected回填数据
    if (isNoSelected(selected)) return;
    const curSettings = getSelectedSettings(designer, selected);
    const lastValues = getSelectedValues(designer, selected, curSettings);
    form?.reset(lastValues);
    setSettingProperties(curSettings);
    updateSelectedValues(designer, selected, lastValues);
    setEdit({ settingsForm: form });
  }, [selected]);

  const onFieldsChange: RenderFormProps['onFieldsChange'] = () => {
    if (isNoSelected(selected)) return;
    const settingsValues = form.getFieldValue();
    updateSelectedValues(designer, selected, settingsValues);
    // 当前字段名更改则同步更改selected
    const { name } = settingsValues;
    if (name) {
      const newSelected = changePathEnd(selected, name);
      setEdit({ selected: newSelected });
    }
  }

  return (
    <div ref={ref} className={cls} style={style}>
      <RenderForm form={form} properties={settingProperties} layout="vertical" onFieldsChange={onFieldsChange} />
    </div>
  );
};

SelectedSettings.displayName = 'selected-settings';
export default React.forwardRef(SelectedSettings);
