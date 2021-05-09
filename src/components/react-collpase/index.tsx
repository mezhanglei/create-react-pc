import React, { useState, useEffect, CSSProperties, useRef, useImperativeHandle } from 'react';
import css from './index.module.less';
import clz from 'classnames/bind';
const styled = clz.bind(css);

export interface ReactCollpaseProps {
  className?: string;
  style?: CSSProperties;
  isExpand?: boolean;
  expand?: any;
  closed?: any;
  hide?: boolean;
  children: any;
}

// 展开收起容器组件
const ReactCollpase = React.forwardRef<any, ReactCollpaseProps>((props, ref) => {

  const [isExpand, setIsExpand] = useState<boolean>(false);

  const containerRef = useRef<any>();

  useImperativeHandle(ref, () => (containerRef?.current));

  useEffect(() => {
    const parent = containerRef?.current;
    const parentScrollHeight = parent?.scrollHeight;
    const parentOffsetHeight = parent?.offsetHeight;
    if (parentScrollHeight <= parentOffsetHeight) {
      setIsExpand(true)
    } else {
      setIsExpand(false)
    }
  }, [])

  useEffect(() => {
    props?.isExpand !== undefined && setIsExpand(props?.isExpand);
  }, [props.isExpand]);

  const toggle = () => {
    setIsExpand(!isExpand);
  }

  const expandComponent = () => {
    return props?.expand ?? <a onClick={toggle}><i className="iconfont iconnext" /></a>
  }

  const closedComponent = () => {
    return props?.closed ?? <a onClick={toggle}><i className="iconfont iconnext" /></a>
  }

  const renderContainer = () => {

    return (
      props.children &&
      <div ref={containerRef} className={styled("toggle-container", isExpand ? "toggle-container-all" : "toggle-container-simple", props.className)} style={props.style}>
        {props.children}
        {
          !props?.hide &&
          <div className={styled("toggle-btn")}>
            {isExpand ? expandComponent() : closedComponent()}
          </div>
        }
      </div>
    );
  }
  return renderContainer();
});

export default React.memo(ReactCollpase);