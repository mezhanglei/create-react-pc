import React from 'react';
import Tippy, { TippyProps } from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional
import './index.less'
import classnames from 'classnames';

interface TooltipCustomProps extends TippyProps {

}

export default React.forwardRef((props: TooltipCustomProps, ref: any) => {
  const {
    children,
    content,
    theme,
    interactive = true,
    className,
    ...rest
  } = props;

  const prefixCls = 'custom-tooltip'
  const classes = {
    light: `${prefixCls}-light`
  }

  const cls = classnames(
    className,
    theme === 'light' ? classes.light : '',
  );

  return (
    <Tippy className={cls} content={content} interactive={interactive} ref={ref} {...rest}>
      {children}
    </Tippy>
  );
});
