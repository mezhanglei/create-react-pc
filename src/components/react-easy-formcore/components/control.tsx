import { isEmpty } from '@/utils/type';
import classnames from 'classnames';
import React, { CSSProperties } from 'react';
import './control.less';

export interface ControlBaseProps {
  error?: string;
  suffix?: React.ReactNode | any; // 右边节点
  footer?: React.ReactNode | any; // 底部节点
}
export interface ControlProps extends ControlBaseProps {
  children: any;
  style?: CSSProperties;
  className?: string;
}

export const Control = React.forwardRef<any, ControlProps>((props, ref) => {
  const {
    children,
    style,
    className,
    error,
    footer,
    suffix,
    ...restProps
  } = props;

  const prefix = 'item-control';

  const cls = classnames(
    `${prefix}__container`,
    error ? `${prefix}--error` : '',
    className ? className : ''
  );

  const isText = typeof children === 'string';

  return (
    <div ref={ref} className={cls} style={style} {...restProps}>
      <div className={classnames(`${prefix}__content`, isText && `${prefix}__content--text`)}>
        {children}
        {!isEmpty(footer) && <div className={`${prefix}__footer`}>{footer}</div>}
      </div>
      {!isEmpty(suffix) && <div className={`${prefix}__suffix`}>{suffix}</div>}
      <div className={`${prefix}__message`}>{error}</div>
    </div>
  );
});
