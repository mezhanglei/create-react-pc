import React, { CSSProperties, useEffect, useMemo } from 'react'
import classnames from 'classnames';
import { Form, joinFormPath, RenderFormChildren, RenderFormProps, useFormStore } from '../../form-render';
import { setDesignerFormValue, getNameSettings, asyncSettingsForm } from '../../utils/utils';
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
    className,
  } = props;

  const { setEdit } = useFormEdit();
  const { selected, designer, designerForm } = useFormDesign();
  const selectedPath = selected?.path;
  const selectedName = selected?.name;
  const attributeName = selected?.attributeName;
  const form = useFormStore();
  const cls = classnames(prefixCls, className);
  const configSettings = useMemo(() => {
    const item = designer.getItemByPath(selectedPath, attributeName);
    return getConfigSettings(item?.id, item?.subId);
  }, [designer, selectedPath, attributeName]); // 配置表单列表
  const nameSettings = useMemo(() => getNameSettings(selected), [selectedPath, attributeName]); // 表单节点字段设置

  useEffect(() => {
    setEdit({ settingsForm: form });
  }, []);

  useEffect(() => {
    asyncSettingsForm(form, selected);
  }, [selectedPath, attributeName]);

  const onFieldsChange: RenderFormProps['onFieldsChange'] = ({ name, value }) => {
    if (typeof name !== 'string') return;
    if (name == 'name') {
      designer?.updateNameByPath(value, selectedPath);
    } else {
      designer?.updateItemByPath(value, selectedPath, joinFormPath(attributeName, name));
    }
    // 非attributeName节点才存在值和selected的更新
    if (!attributeName) {
      if (name === 'initialValue') {
        // 如果是值的更新则同时更新编辑区域表单
        setDesignerFormValue(designerForm, selectedName, value);
      } else if (name === 'name') {
        // 更新name字段时需要同步当前选中项
        const joinName = joinFormPath(selected?.parent?.name, value);
        const joinPath = joinFormPath(selected?.parent?.path, value);
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
