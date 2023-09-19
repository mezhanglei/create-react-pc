import React, { CSSProperties, useEffect, useMemo } from 'react'
import classnames from 'classnames';
import { Form, joinFormPath, RenderFormChildren, RenderFormProps, useFormStore } from '../../form-render';
import { setDesignerFormValue, getNameSetting, asyncSettingForm } from '../../form-render/utils/utils';
import { useFormDesign, useFormEdit } from '../../form-render/utils/hooks';
import './component.less';
import CustomCollapse from '../../form-render/components/Collapse';
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

  // useEffect(() => {
  //   asyncSettingForm(form, designer, selected);
  // }, [selectedPath, attributeName]);

  const onFieldsChange: RenderFormProps['onFieldsChange'] = ({ name, value }) => {
    if (typeof name !== 'string') return;
    if (name == 'name') {
      designer?.updateNameByPath(value, selectedPath);
      // 选中项同步新字段
      if (!attributeName) {
        const joinName = joinFormPath(selected?.parent?.name, value);
        const joinPath = joinFormPath(selected?.parent?.path, value);
        setEdit({ selected: { ...selected, name: joinName, path: joinPath } });
      }
    } else {
      designer?.updateItemByPath(value, selectedPath, joinFormPath(attributeName, name));
      if (!attributeName) {
        // 同步编辑区域表单值
        if (name === 'initialValue') {
          setDesignerFormValue(designerForm, selectedName, value);
        }
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
        <RenderFormChildren properties={nameSetting} uneval />
        {renderCommonList()}
      </Form>
    </div>
  );
};

SelectedSetting.displayName = 'component-setting';
export default React.forwardRef(SelectedSetting);
