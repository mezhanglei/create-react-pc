import React, { CSSProperties, forwardRef } from 'react';
import Provider from './provider';
import Sidebar from './sidebar';
import Viewer from './viewer';
import Properties from './properties';
import classnames from 'classnames';

export interface DesignFormProps {
  className?: string
  style?: CSSProperties
}

const prefixCls = 'fr-generator-container';
const classes_design = {
  design: prefixCls,
  component: `${prefixCls}__component`,
  viewer: `${prefixCls}__viewer`,
  properties: `${prefixCls}__properties`
}

const Generator = ({ className, ...props }: DesignFormProps, ref: any) => {
  return (
    <Provider ref={ref} {...props}>
      <div className={classnames(classes_design.design, className)}>
        <Sidebar />
        <Viewer />
        <Properties />
      </div>
    </Provider>
  );
}

Generator.Provider = Provider;
Generator.Sidebar = Sidebar;
Generator.Viewer = Viewer;
Generator.Properties = Properties;

export default forwardRef(Generator);