import React, { CSSProperties } from 'react'
import classnames from 'classnames';
import Icon from '@/components/svg-icon';
import './tag.less';

export interface TagProps {
  className?: string
  style?: CSSProperties
  children: any
  onChange: () => void
  icon: string;
}
const prefixCls = 'component-tag';
function Tag(props: TagProps, ref: any) {
  const {
    style,
    className,
    children,
    onChange,
    icon,
    ...restProps
  } = props;

  const cls = classnames(prefixCls, className)

  return (
    <span onClick={onChange} ref={ref} className={cls} style={style} {...restProps}>
      <div className={`${prefixCls}-icon`}>
        <Icon name={icon} />
      </div>
      {children}
    </span>
  );
};

export default React.forwardRef(Tag);
