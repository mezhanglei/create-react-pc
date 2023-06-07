import React, { CSSProperties, useEffect, useMemo } from 'react'
import classnames from 'classnames';
import { Form, joinFormPath, RenderFormChildren, RenderFormProps, useFormStore } from '../../form-render';
import { getDesignerItem, isNoSelected, setDesignerFormValue, getNameSettings, updateDesignerItem } from '../../utils/utils';
import { useFormDesign, useFormEdit } from '../../utils/hooks';
import './component.less';
import CustomCollapse from '../../form-render/components/collapse';
import getConfigSettings from '../components/settings';

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

  const { setEdit } = useFormEdit();
  const { selected, designer, designerForm } = useFormDesign();
  const selectedPath = selected?.path;
  const selectedName = selected?.name;
  const attributeName = selected?.attributeName;
  const form = useFormStore();
  const cls = classnames(prefixCls, className);
  const configSettings = useMemo(() => {
    const item = getDesignerItem(designer, selectedPath, attributeName);
    return getConfigSettings(item?.id, item?.subId);
  }, [designer, selectedPath, attributeName]); // 配置表单列表
  const nameSettings = useMemo(() => getNameSettings(designer, selected), [designer, selectedPath, attributeName]); // 表单节点字段设置

  useEffect(() => {
    setEdit({ settingsForm: form });
  }, []);

  const onFieldsChange: RenderFormProps['onFieldsChange'] = () => {
    if (isNoSelected(selectedPath)) return;
    const settingsValues = form.getFieldValue();
    updateDesignerItem(designer, settingsValues, selectedPath, attributeName);
    // 非属性节点才可以设同步值
    if (!attributeName) {
      setDesignerFormValue(designerForm, selectedName, settingsValues?.initialValue);
      // 当前字段名更改则同步更改selected
      const { name } = settingsValues;
      const joinName = joinFormPath(selected?.parent?.name, name);
      const joinPath = joinFormPath(selected?.parent?.path, name);
      if (name) {
        setEdit({ selected: { ...selected, name: joinName, path: joinPath } });
      }
    }
  }

  const renderCommonList = () => {
    if (!configSettings) return;
    return (
      Object.entries(configSettings)?.map(([title, settings]) => {
        return (
          <CustomCollapse header={title} key={title} isOpened>
            <RenderFormChildren properties={settings} />
          </CustomCollapse>
        )
      })
    )
  }

  return (
    <div ref={ref} className={cls} style={style}>
      <Form layout="vertical" form={form} onFieldsChange={onFieldsChange}>
        <RenderFormChildren properties={nameSettings} />
        {renderCommonList()}
      </Form>
    </div>
  );
};

SelectedSettings.displayName = 'component-settings';
export default React.forwardRef(SelectedSettings);
