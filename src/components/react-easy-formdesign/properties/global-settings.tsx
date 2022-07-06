import React, { CSSProperties, useContext } from 'react'
import classnames from 'classnames';
import RenderForm, { useFormRenderStore } from '../form-render';
import { FormRenderContext } from '../design-context';
import { globalSettings } from '../config/global-settings';

export interface GlobalSettingsProps {
  className?: string
  style?: CSSProperties
}
const prefixCls = 'global-settings';
function GlobalSettings(props: GlobalSettingsProps, ref: any) {
  const {
    style,
    className
  } = props;
  const { store } = useContext(FormRenderContext);
  const formRender = useFormRenderStore();

  const cls = classnames(prefixCls, className)

  return (
    <div ref={ref} className={cls} style={style}>
       <RenderForm store={formRender} schema={globalSettings}
      />
    </div>
  );
};

GlobalSettings.displayName = 'global-settings';
export default React.forwardRef(GlobalSettings);
