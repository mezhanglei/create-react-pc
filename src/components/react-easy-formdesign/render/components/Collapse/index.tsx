import React, { useState } from 'react';
import "./index.less";
import classNames from 'classnames';
import SvgIcon from '@/components/SvgIcon';
import { useCollapse } from 'react-collapsed';

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

  const [isExpanded, setExpanded] = useState(isOpened);
  const { getCollapseProps } = useCollapse({ isExpanded });

  const prefix = 'setting-collapse';
  const cls = classNames(prefix, className);

  return (
    <div className={cls}>
      <div className={`${prefix}-header`} onClick={() => setExpanded(!isExpanded)}>
        <div>{header}</div>
        {
          isExpanded ?
            <SvgIcon name="zhedie-down" />
            :
            <SvgIcon name="zhedie-right" />
        }
      </div>
      <div {...getCollapseProps()}>
        {children}
      </div>
    </div>
  );
};

export default CustomCollapse;
