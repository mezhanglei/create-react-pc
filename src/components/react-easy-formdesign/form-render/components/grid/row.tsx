import { GridRow as BaseGridRow } from '@/components/react-easy-formrender/components/grid';
import { GeneratePrams } from '../..';
import React from 'react';
import Selection from './row-selection';
import { RowProps } from 'antd';
import { ELementProps } from '@/components/react-easy-formdesign/form-designer/components/configs';

// row组件
export type CustomRowProps = RowProps & GeneratePrams<ELementProps>;

export const GridRow = React.forwardRef<any, CustomRowProps>((props, ref) => {
  const {
    // name,
    // field,
    // parent,
    // store,
    // form,
    children,
    className,
    style,
    ...rest
  } = props;

  const { field } = rest || {};
  const isEditor = field?.isEditor;

  return (
    <BaseGridRow ref={ref} style={style} className={className} {...rest}>
      {isEditor ?
        <Selection {...rest}>
          {children}
        </Selection>
        :
        children
      }
    </BaseGridRow>
  );
});
