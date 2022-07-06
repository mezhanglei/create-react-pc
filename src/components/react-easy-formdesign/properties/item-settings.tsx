import React, { CSSProperties, useContext, useState } from 'react'
import classnames from 'classnames';
import RenderForm, { useFormRenderStore } from '../form-render';
import { FormRenderContext } from '../design-context';

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
  const { settings } = useContext(FormRenderContext);
  const formRender = useFormRenderStore();

  const [settingSchema, setSettingSchema] = useState({});

  const cls = classnames(prefixCls, className)

  return (
    <div ref={ref} className={cls} style={style}>
      <RenderForm store={formRender} schema={settingSchema} />
    </div>
  );
};

ItemSettings.displayName = 'item-settings';
export default React.forwardRef(ItemSettings);
