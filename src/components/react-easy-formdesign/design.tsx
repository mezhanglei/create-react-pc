import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import { DesignStore } from './design-store';
import { DesignStoreContext } from './design-store-context';

export interface DesignFormProps {
  className?: string
  style?: CSSProperties
}

const prefixCls = 'easy-form-design';
const classes_design = {
  design: prefixCls,
  base: `${prefixCls}__base`,
  viewer: `${prefixCls}__viewer`,
  properties: `${prefixCls}__properties`
}
export default function DesignForm(props: DesignFormProps) {
  const { className, style, ...options } = props;

  const store = new DesignStore();

  return (
    <DesignStoreContext.Provider value={store}>
      <div className={classnames(classes_design.design, className)} style={style}>
        <div className={classes_design.base}>
1111
        </div>
        <div className={classes_design.viewer}>
222
        </div>
        <div className={classes_design.properties}>
333
        </div>
      </div>
    </DesignStoreContext.Provider>
  );
}