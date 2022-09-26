import classnames from 'classnames';
import React, { CSSProperties } from 'react';
import './control.less';

export interface ControlBaseProps {
  compact?: boolean;
  error?: string;
  suffix?: React.ReactNode | any; // 右边节点
  footer?: React.ReactNode | any; // 底部节点
}
export interface ControlProps extends ControlBaseProps {
  children: any;
  style?: CSSProperties;
  className?: string;
}

export const Control = React.forwardRef((props: ControlProps, ref: any) => {
  const {
    children,
    style,
    className,
    error,
    compact,
    footer,
    suffix,
    ...restProps
  } = props;

  const prefix = 'item-control';

  const cls = classnames(
    `${prefix}__container`,
    error ? `${prefix}--error` : '',
    compact ? `${prefix}--compact` : '',
    className ? className : ''
  );

  const isText = typeof children === 'string';

  return (
    <div ref={ref} className={cls} style={style} {...restProps}>
      <div className={classnames(`${prefix}__content`, isText && `${prefix}__content--text`)}>
        {children}
        {footer !== undefined && <div className={`${prefix}__footer`}>{footer}</div>}
      </div>
      {suffix !== undefined && <div className={`${prefix}__suffix`}>{suffix}</div>}
      <div className={`${prefix}__message`}>{error}</div>
    </div>
  );
});
