import React, { LegacyRef } from 'react';
import './index.less';

const SvgIcon = React.forwardRef((props: { name: string, className?: string }, ref: LegacyRef<SVGSVGElement>) => {
  const { name, className, ...rest } = props
  const svgClass = className ? 'svg-icon ' + className : 'svg-icon';
  const iconName = `#${name}`;
  return (
    <svg className={svgClass} aria-hidden="true" ref={ref} {...rest}>
      <use xlinkHref={iconName} />
    </svg>
  );
});

export default SvgIcon;