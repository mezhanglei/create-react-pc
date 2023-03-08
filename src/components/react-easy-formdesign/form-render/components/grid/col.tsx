import { ELementProps } from '@/components/react-easy-formdesign/form-designer/components/configs';
import { GridCol as BaseGridCol } from '@/components/react-easy-formrender/components/grid';
import { ColProps } from 'antd';
import classnames from 'classnames';
import React from 'react';
import { GeneratePrams } from '../..';
import Selection from './selection';

// row组件
export type CustomColProps = ColProps & GeneratePrams<ELementProps>;
// col组件
export const GridCol = React.forwardRef<any, CustomColProps>((props, ref) => {
  const {
    // name,
    // field,
    // parent,
    // store,
    // form,
    className,
    children,
    style,
    ...rest
  } = props;

  const { field } = rest || {};
  const isEditor = field?.isEditor;

  const cls = classnames('grid-edit-col', className);

  return (
    <BaseGridCol ref={ref} style={style} className={cls} {...rest}>
      {isEditor ?
        <Selection {...rest}>
          {children}
        </Selection>
        :
        children
      }
    </BaseGridCol>
  );
});
