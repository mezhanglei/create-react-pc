import { Collapse } from 'react-collapse';
import React, { useEffect, useState } from 'react';
import "./index.less";
import classNames from 'classnames';

export interface CustomCollapseProps extends React.HtmlHTMLAttributes<HTMLElement> {
  header?: React.ReactNode;
  isOpened?: boolean; // 是否
}

const CustomCollapse: React.FC<CustomCollapseProps> = (props) => {

  const {
    header,
    children,
    isOpened,
    className,
    ...rest
  } = props;

  const [isOpenedState, setIsOpenedState] = useState<boolean>();

  useEffect(() => {
    setIsOpenedState(isOpened)
  }, [isOpened])

  const prefix = 'design-settings-collapse';
  const cls = classNames(prefix, className);

  return (
    <div className={cls}>
      <div className={`${prefix}-header`} onClick={() => setIsOpenedState(!isOpenedState)}>
        <div>{header}</div>
        {
          isOpenedState ?
            <i className='iconfont icon-jichu25-zhedie' />
            :
            <i className='iconfont icon-zhedie' />
        }
      </div>
      <Collapse isOpened={isOpenedState} {...rest}>
        {children}
      </Collapse>
    </div>
  );
}

export default CustomCollapse;
