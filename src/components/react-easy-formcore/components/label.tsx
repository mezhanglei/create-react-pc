import classnames from 'classnames';
import React, { CSSProperties, useEffect, useRef } from 'react';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import './label.less';
import Icon from '@/components/svg-icon';

export interface LabelBaseProps {
  colon?: boolean;
  required?: boolean;
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

export const Label = React.forwardRef((props: LabelProps, ref: any) => {
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
    ...restProps
  } = props;

  const iconRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (tooltip && iconRef.current) {
      tippy(iconRef.current, {
        theme: 'light',
        content: tooltip,
      });
    }
  }, [tooltip]);

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
    children !== undefined ? (
      <label ref={ref} className={cls} style={mergeStyle} {...restProps}>
        {colon === true ? <>{children}:</> : children}
        {tooltip && <Icon name="wenhao" ref={iconRef} className={`${prefix}__tooltip`} />}
      </label>
    ) : null
  );
});
