import classnames from 'classnames';
import React, { CSSProperties } from 'react';
import './label.less';
import Icon from '@/components/svg-icon';
import Tooltip from '@/components/tooltip';
import { isValidChildren } from '@/utils/ReactIs';

export interface LabelBaseProps {
  colon?: boolean;
  required?: boolean;
  showLabel?: boolean;
  labelWidth?: CSSProperties['width'];
  labelAlign?: CSSProperties['textAlign'];
  labelStyle?: CSSProperties;
  gutter?: number;
  tooltip?: string;
}
export interface LabelProps extends LabelBaseProps {
  children: any;
  style?: CSSProperties;
  className?: string;
}

export const Label = React.forwardRef<any, LabelProps>((props, ref) => {
  const {
    children,
    style,
    className,
    colon,
    required,
    gutter,
    labelWidth,
    labelAlign,
    tooltip,
    showLabel = true,
    ...restProps
  } = props;

  const prefix = 'item-label';

  const cls = classnames(
    `${prefix}__header`,
    required === true ? `${prefix}--required` : '',
    className ? className : ''
  );

  const mergeStyle = {
    marginRight: gutter,
    width: labelWidth,
    textAlign: labelAlign,
    ...style
  }

  return (
    isValidChildren(children) && showLabel ? (
      <label ref={ref} className={cls} style={mergeStyle} {...restProps}>
        {colon === true ? <>{children}:</> : children}
        {tooltip && (
          <Tooltip content={tooltip} theme="light">
            <Icon name="wenhao" className={`${prefix}__tooltip`} />
          </Tooltip>)
        }
      </label>
    ) : null
  );
});
