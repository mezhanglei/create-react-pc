import { GridRow, GridRowProps } from '@/components/react-easy-formrender/components/grid';
import { CustomOptions } from '../..';
import React from 'react';
import Selection from './selection';

// row组件
export type CustomRowProps = GridRowProps & CustomOptions;

export const Row = React.forwardRef<any, CustomRowProps>((props, ref) => {
  const {
    // name,
    // field,
    // parent,
    // store,
    // form,
    isEditor,
    children,
    className,
    style,
    ...rest
  } = props;
  console.log(props, 222)
  return (
    <GridRow ref={ref} style={style} className={className} {...rest}>
      {isEditor ?
        <Selection {...rest}>
          {children}
        </Selection>
        :
        children
      }
    </GridRow>
  );
});
