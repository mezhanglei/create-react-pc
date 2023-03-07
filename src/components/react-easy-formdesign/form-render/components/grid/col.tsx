import { GridCol, GridColProps } from '@/components/react-easy-formrender/components/grid';
import classnames from 'classnames';
import React from 'react';
import { CustomOptions } from '../..';

// row组件
export type CustomColProps = GridColProps & CustomOptions;
// col组件
export const Col = React.forwardRef<any, CustomColProps>((props, ref) => {
  const {
    // name,
    // field,
    // parent,
    // store,
    // form,
    isEditor,
    className,
    children,
    ...rest
  } = props;

  const cls = classnames('grid-edit-col', className);

  return (
    <GridCol ref={ref} className={cls} {...rest}>
      {children}
    </GridCol>
  );
});
