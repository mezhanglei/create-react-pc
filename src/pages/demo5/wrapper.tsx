import classnames from 'classnames';
import React, { CSSProperties } from 'react';
import './wrapper.less';

export interface WrapperProps {
  children: any;
  style?: CSSProperties;
  className?: string;
  active?: boolean; // 是否选中
}

function Wrapper(props: WrapperProps, ref: any) {
  const {
    children,
    style,
    className,
    active,
    ...restProps
  } = props;

  const prefixCls = "field-wrapper";

  const cls = classnames('field-wrapper', className, {
    [`${prefixCls}-active`]: active
  })

  const Tool = (
    <div className='wrapper-tools'>
      <div>
        <i className='iconfont icon-shanchu' />
        <i className='iconfont icon-fuzhi' />
      </div>
    </div>
  );

  return (
    <div ref={ref} className={cls} style={style} {...restProps}>
      {active ? Tool : null}
      {children}
    </div>
  );
};

export default React.forwardRef(Wrapper);