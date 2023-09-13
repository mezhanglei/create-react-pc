import React, { CSSProperties, useEffect, useMemo } from 'react'
import classnames from 'classnames';
import { Form, joinFormPath, RenderFormChildren, RenderFormProps, useFormStore } from '../../form-render';
import { setDesignerFormValue, getNameSetting, asyncSettingForm } from '../../form-render/utils/utils';
import { useFormDesign, useFormEdit } from '../../form-render/utils/hooks';
import './component.less';
import CustomCollapse from '../../form-render/components/base/Collapse';
export interface SelectedSettingProps {
  className?: string
  style?: CSSProperties
}
const prefixCls = 'item-setting';

// 选中节点的属性设置
function SelectedSetting(props: SelectedSettingProps, ref: any) {
  const {
    style,
    className,
  } = props;

  const { setEdit } = useFormEdit();
  const { selected, designer, designerForm, settings } = useFormDesign();
  const selectedPath = selected?.path;
  const selectedName = selected?.name;
  const attributeName = selected?.attributeName;
  const form = useFormStore();
  const cls = classnames(prefixCls, className);
  const configSetting = useMemo(() => {
    const field = selected?.field;
    const type = field?.type;
    const itemSetting = type && settings ? settings[type] : undefined;
    const selectedSetting = selected?.setting; // 如果有setting则优先
    return selectedSetting || itemSetting;
  }, [designer, selectedPath, attributeName, settings]);
  const nameSetting = useMemo(() => getNameSetting(selected), [selectedPath, attributeName]); // 表单节点字段设置

  useEffect(() => {
    setEdit({ settingForm: form });
  }, []);

  useEffect(() => {
    asyncSettingForm(form, selected);
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
    if (!configSetting) return;
    return (
      Object.entries(configSetting)?.map(([name, data]) => {
        return (
          <CustomCollapse header={name} key={name} isOpened>
            <RenderFormChildren properties={data} />
          </CustomCollapse>
        )
      })
    )
  }

  return (
    <div ref={ref} className={cls} style={style}>
      <Form layout="vertical" form={form} onFieldsChange={onFieldsChange}>
        <RenderFormChildren properties={nameSetting} />
        {renderCommonList()}
      </Form>
    </div>
  );
};

SelectedSetting.displayName = 'component-setting';
export default React.forwardRef(SelectedSetting);
