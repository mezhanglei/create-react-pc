import React, { CSSProperties } from 'react';
import classnames from 'classnames';

export interface DeleteBtnProps {
  onClick?: () => void;
  className?: string;
  style?: CSSProperties
}
export const DeleteBtn: React.FC<DeleteBtnProps> = (props) => {

  const {
    className,
    ...restProps
  } = props;

  const cls = classnames('iconfont icon-shanchu', className)
  return <i className={cls} {...restProps} />
}
