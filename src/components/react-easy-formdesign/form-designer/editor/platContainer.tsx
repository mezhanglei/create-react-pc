import classnames from 'classnames';
import React from 'react';
import './platContainer.less';

export const PlatOptions = [
  { label: 'PC', value: 'pc' },
  { label: 'Pad', value: 'pad' },
  { label: 'Phone', value: 'phone' }
];

export type PlatType = typeof PlatOptions[number]["value"]
export interface PlatContainerProps extends React.HtmlHTMLAttributes<any> {
  plat: PlatType;
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

  const renderPhone = (
    <>
      <div className='mobile-head'></div>
      <div className="mobile-content">
        <div className='phone-bar'></div>
        <div className='phone-screen'>
          {children}
        </div>
      </div>
      <div className='mobile-foot'></div>
    </>
  );

  return (
    <div ref={ref} className={classnames('form-container', className, {
      'pc': isPc,
      'pad': isPad,
      'phone': isPhone
    })}>
      {isPhone ? renderPhone : children}
    </div>
  );
};

export default React.forwardRef(PlatContainer);
