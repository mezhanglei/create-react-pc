import React, { CSSProperties } from 'react'
import classnames from 'classnames';
import './tag.less';

export interface TagProps {
  className?: string
  style?: CSSProperties
  children: any
  onChange: () => void
}
const prefixCls = 'component-tag';
function Tag(props: TagProps, ref: any) {
  const {
    style,
    className,
    children,
    onChange,
    ...restProps
  } = props;

  const cls = classnames(prefixCls, className)

  return (
    <span onClick={onChange} ref={ref} className={cls} style={style} {...restProps}>
      {children}
    </span>
  );
};

export default React.forwardRef(Tag);
