import classnames from 'classnames';
import React, { CSSProperties } from 'react';
import { Row } from 'react-flexbox-grid';
import './control.less';

export interface ControlProps {
  children: any;
  style?: CSSProperties;
  className?: string;
  compact?: boolean;
  error?: string;
  suffix?: React.ReactNode | any; // 右边节点
  footer?: React.ReactNode | any; // 底部节点
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

  return (
    <div ref={ref} className={cls} style={style} {...restProps}>
      <Row className={`${prefix}__control`}>
        {children}
        {footer !== undefined && <div className={`${prefix}__footer`}>{footer}</div>}
      </Row>
      {suffix !== undefined && <div className={`${prefix}__suffix`}>{suffix}</div>}
      <div className={`${prefix}__message`}>{error}</div>
    </div>
  );
});
