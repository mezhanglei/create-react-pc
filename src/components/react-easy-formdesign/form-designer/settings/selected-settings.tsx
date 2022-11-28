import React, { CSSProperties, useContext, useEffect, useState } from 'react'
import classnames from 'classnames';
import RenderForm, { getCurrentPath, RenderFormProps, useFormStore } from '../../form-render';
import { FormDesignContext, FormEditContext } from '../designer-context';
import { updateSelectedValues, getSelectedValues, isNoSelected, getSelectedSettings } from '../utils/utils';
// import { changePathEnd } from '@/components/react-easy-formrender/utils/utils';

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
  const { designer, designerForm, selected } = useContext(FormDesignContext);
  const { setEdit } = useContext(FormEditContext)
  const selectedName = selected?.name;
  const selectedParent = selected?.parent;
  const selectedPath = getCurrentPath(selectedName, selectedParent) as string;
  const form = useFormStore();

  const [settingProperties, setSettingProperties] = useState({});

  const cls = classnames(prefixCls, className);

  useEffect(() => {
    // 根据selected回填数据
    if (isNoSelected(selectedName)) return;
    const curSettings = getSelectedSettings(designer, selectedPath);
    const lastValues = getSelectedValues(designer, selectedPath, curSettings);
    form?.reset(lastValues);
    setSettingProperties(curSettings);
    updateSelectedValues(designer, designerForm, selectedPath, lastValues);
    setEdit({ settingsForm: form });
  }, [selectedPath]);

  const onFieldsChange: RenderFormProps['onFieldsChange'] = () => {
    if (isNoSelected(selectedName)) return;
    const settingsValues = form.getFieldValue();
    updateSelectedValues(designer, designerForm, selectedPath, settingsValues);
    // 当前字段名更改则同步更改selected
    const { name } = settingsValues;
    if (name) {
      // const newSelected = changePathEnd(selectedPath, name);
      setEdit({ selected: { ...selected, name } })
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
