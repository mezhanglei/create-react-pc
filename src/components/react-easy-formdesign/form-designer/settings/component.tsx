import React, { CSSProperties, useEffect, useMemo } from 'react'
import classnames from 'classnames';
import { Form, RenderFormChildren, RenderFormProps, useFormStore } from '../../form-render';
import { updateDesignerItem, getDesignerItem, isNoSelected, setDesignerFormValue, getNameSettings } from '../../utils/utils';
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

  const setEdit = useFormEdit();
  const { selected, selectedPath, selectedFormPath, designer, designerForm } = useFormDesign();
  const attributeName = selected?.attributeName;
  const form = useFormStore();
  const cls = classnames(prefixCls, className);
  const configSettings = useMemo(() => {
    const item = getDesignerItem(designer, selectedPath, attributeName);
    return getConfigSettings(item?.id, item?.subId);
  }, [selectedPath, attributeName]); // 配置表单列表
  const nameSettings = useMemo(() => getNameSettings(designer, selected), [designer, selected]); // 表单节点字段设置

  useEffect(() => {
    // 根据selected回填数据
    setSettingsForm();
    setSettingsFormValue(selectedPath, attributeName);
  }, [selectedPath, attributeName]);

  const onFieldsChange: RenderFormProps['onFieldsChange'] = () => {
    if (isNoSelected(selectedPath)) return;
    const settingsValues = form.getFieldValue();
    updateDesignerItem(designer, settingsValues, selectedPath, attributeName);
    // 非属性节点
    if (!attributeName) {
      setDesignerFormValue(designerForm, selectedFormPath, settingsValues?.initialValue);
      // 当前字段名更改则同步更改selected
      const { name } = settingsValues;
      if (name) {
        setEdit({ selected: { ...selected, name } });
      }
    }
  }

  // 设置配置表单
  const setSettingsForm = () => {
    if (isNoSelected(selectedPath)) {
      setEdit({ settingsForm: null });
      return;
    };
    setEdit({ settingsForm: form });
  }

  // 配置属性表单值
  const setSettingsFormValue = (path?: string, attributeName?: string) => {
    if (isNoSelected(path)) return;
    const curSettingsValues = getDesignerItem(designer, path, attributeName);
    form?.reset(attributeName ? curSettingsValues : { ...curSettingsValues, name: selected?.name }); // 回填属性区域数据
    updateDesignerItem(designer, curSettingsValues, path, attributeName); // 同步编辑区域
    // 回填编辑区默认值
    if (!attributeName) {
      setDesignerFormValue(designerForm, selectedFormPath, curSettingsValues?.initialValue);
    }
  }

  const renderCommonList = () => {
    if (!configSettings) return;
    return (
      Object.entries(configSettings)?.map((item) => {
        const [title, settings] = item;
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
      <Form layout="vertical" store={form} onFieldsChange={onFieldsChange}>
        <RenderFormChildren properties={nameSettings} />
        {renderCommonList()}
      </Form>
    </div>
  );
};

SelectedSettings.displayName = 'component-settings';
export default React.forwardRef(SelectedSettings);
