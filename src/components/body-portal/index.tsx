import React from 'react';
import ReactDOM from 'react-dom';

/**
 * 插入根节点组件
 * @param props 
 * @returns 
 */
export const BodyPortal: React.FC = (props) => {
  const elBox = React.useRef<HTMLDivElement>(document.createElement('div'));

  React.useEffect(() => {
    const portal = elBox.current;
    (portal.style.position as React.CSSProperties['position']) = 'relative';
    document.body.appendChild(portal);
    return () => {
      document.body.removeChild(portal);
    };
  }, []);

  return ReactDOM.createPortal(props.children, elBox.current);
};

export function withBodyPortal<P>(component: any) {
  return React.forwardRef<unknown, P>((props, ref) => (
    <BodyPortal>{React.createElement(component, { ...props, ref })}</BodyPortal>
  ));
}
