import classnames from 'classnames';
import React from 'react';
import './platContainer.less';

export interface PlatContainerProps extends React.HtmlHTMLAttributes<any> {
  plat: 'pc' | 'pad' | 'phone'
}

function PlatContainer(props: PlatContainerProps, ref: any) {
  const {
    plat,
    className,
    children
  } = props;
  const isPc = plat === 'pc';
  const isPad = plat === 'pad';
  const isPhone = plat === 'phone';
  return (
    <div ref={ref} className={classnames('form-container', className, {
      'pc': isPc,
      'ipad': isPad,
      'phone': isPhone
    })}>
      {children}
    </div>
  )
};

export default React.forwardRef(PlatContainer);
