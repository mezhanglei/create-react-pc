import React, { CSSProperties, useContext, useEffect, useState } from 'react'
import classnames from 'classnames';
import RenderForm, { RenderFormProps, useFormRenderStore } from '../form-render';
import { FormEditContext, FormRenderContext } from '../design-context';
import { allElements } from '../config';

export interface ItemSettingsProps {
  className?: string
  style?: CSSProperties
}
const prefixCls = 'item-settings';
function ItemSettings(props: ItemSettingsProps, ref: any) {
  const {
    style,
    className
  } = props;
  const { formRenderStore, selected, selectedType } = useContext(FormRenderContext);
  const setEdit = useContext(FormEditContext);
  const form = useFormRenderStore();

  const [settingSchema, setSettingSchema] = useState({});

  const cls = classnames(prefixCls, className)

  useEffect(() => {
    if (!selected || selected === '#') return;
    const elements = allElements;
    const settings = elements[selectedType]?.['settings'];
    const newSettings = settings;
    setSettingSchema({ properties: newSettings });
  }, [selected]);

  // useEffect(() => {
  //   if(settingSchema) {
  //     const lastProps = formRenderStore?.getItemByPath(selected);
  //     form.setFieldsValue(lastProps);
  //   }
  // }, [settingSchema]);

  const onValuesChange: RenderFormProps['onValuesChange'] = ({ path, value }) => {
    console.log(selected)
  }

  return (
    <div ref={ref} className={cls} style={style}>
      <RenderForm store={form} schema={settingSchema} layout="vertical" onValuesChange={onValuesChange} />
    </div>
  );
};

ItemSettings.displayName = 'item-settings';
export default React.forwardRef(ItemSettings);
