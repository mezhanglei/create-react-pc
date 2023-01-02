import React, { CSSProperties, useContext, useEffect, useMemo, useState } from 'react'
import classnames from 'classnames';
import { Form, getCurrentPath, RenderFormChildren, RenderFormProps, useFormStore } from '../../form-render';
import { FormDesignContext, FormEditContext } from '../designer-context';
import { updateSelectedValues, getSelectedValues, isNoSelected, getCurSettings, getCommonSettingsList } from '../utils/utils';
import CustomCollapse from '../../form-render/collapse';

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
  const cls = classnames(prefixCls, className);
  const curSettings = useMemo(() => (getCurSettings(designer, selectedPath) || {}), [designer, selectedPath]);  // 主要配置表单
  const commonSettingsList = useMemo(() => (getCommonSettingsList(designer, selectedPath) || []), [designer, selectedPath]); // 公共配置表单列表

  useEffect(() => {
    // 根据selected回填数据
    setSettingsForm(selectedPath);
    setSettingsFormValue(selectedPath);
  }, [selectedPath]);

  const onFieldsChange: RenderFormProps['onFieldsChange'] = () => {
    if (isNoSelected(selectedPath)) return;
    const settingsValues = form.getFieldValue();
    updateSelectedValues(designer, designerForm, selectedPath, settingsValues);
    // 当前字段名更改则同步更改selected
    const { name } = settingsValues;
    if (name) {
      setEdit({ selected: { ...selected, name } })
    }
  }

  // 设置配置表单
  const setSettingsForm = (selectedPath: string) => {
    if (isNoSelected(selectedPath)) {
      setEdit({ settingsForm: null });
      return;
    };
    setEdit({ settingsForm: form });
  }

  // 配置属性表单值
  const setSettingsFormValue = (selectedPath: string) => {
    if (isNoSelected(selectedPath)) return;
    const curSettingsValues = getSelectedValues(designer, selectedPath); // 获取节点控件已有的值
    form?.reset(curSettingsValues); // 设置配置表单值
    updateSelectedValues(designer, designerForm, selectedPath, curSettingsValues); // 同步更新节点控件
  }

  const renderCommonList = () => {
    if (!commonSettingsList?.length) return;
    return (
      commonSettingsList?.map((item) => {
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
        <RenderFormChildren properties={curSettings} />
        {renderCommonList()}
      </Form>
    </div>
  );
};

SelectedSettings.displayName = 'component-settings';
export default React.forwardRef(SelectedSettings);
