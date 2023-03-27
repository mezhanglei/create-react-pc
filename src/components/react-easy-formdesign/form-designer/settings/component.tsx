import React, { CSSProperties, useEffect, useMemo } from 'react'
import classnames from 'classnames';
import { Form, RenderFormChildren, RenderFormProps, useFormStore } from '../../form-render';
import { updateDesignerItem, getDesignerItem, isNoSelected, getSettingsModule, getNameSettings, setDesignerFormValue } from '../../utils/utils';
import CustomCollapse from '../../form-render/components/collapse';
import { useFormDesign, useFormEdit } from '../../utils/hooks';
import './component.less';

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
  const form = useFormStore();
  const cls = classnames(prefixCls, className);
  const settingsModule = useMemo(() => (getSettingsModule(getDesignerItem(designer, selectedPath)?.id) || []), [designer, selectedPath]); // 配置表单列表
  const nameSettings = useMemo(() => (getNameSettings(selectedPath)), [selectedPath]); // 表单的name设置

  useEffect(() => {
    // 根据selected回填数据
    setSettingsForm();
    setSettingsFormValue(selectedPath);
  }, [selectedPath]);

  const onFieldsChange: RenderFormProps['onFieldsChange'] = () => {
    if (isNoSelected(selectedPath)) return;
    const settingsValues = form.getFieldValue();
    updateDesignerItem(designer, selectedPath, settingsValues);
    setDesignerFormValue(designerForm, selectedFormPath, settingsValues?.initialValue);
    // 当前字段名更改则同步更改selected
    const { name } = settingsValues;
    if (name) {
      setEdit({ selected: { ...selected, name } });
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
  const setSettingsFormValue = (path?: string) => {
    if (isNoSelected(path)) return;
    const curSettingsValues = getDesignerItem(designer, path); // 获取节点控件已有的值
    form?.reset(curSettingsValues); // 设置配置表单值
    updateDesignerItem(designer, path, curSettingsValues); // 同步更新节点控件
    setDesignerFormValue(designerForm, selectedFormPath, curSettingsValues?.initialValue);
  }

  const renderCommonList = () => {
    if (!settingsModule?.length) return;
    return (
      settingsModule?.map((item) => {
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
