import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import './delete-btn.less';

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

  const cls = classnames('iconfont icon-biaodankongjianshanchu', className)
  return <i className={cls} {...restProps} />
}
