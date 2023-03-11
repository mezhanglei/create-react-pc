import { GridRow as BaseGridRow } from '@/components/react-easy-formrender/components/grid';
import { GeneratePrams } from '../..';
import React from 'react';
import RowSelection from './row-selection';
import { RowProps } from 'antd';
import { ELementProps } from '@/components/react-easy-formdesign/form-designer/components/configs';
import classnames from 'classnames';
import './row.less';

// row组件
export type CustomRowProps = RowProps & GeneratePrams<ELementProps>;

export const GridRow = React.forwardRef<any, CustomRowProps>((props, ref) => {
  const {
    children,
    className,
    style,
    ...rest
  } = props;

  const { field } = rest || {};
  const isEditor = field?.isEditor;
  const cls = classnames(className, {
    'edit-row': isEditor
  });

  return (
    <BaseGridRow ref={ref} style={style} className={cls} {...rest}>
      {isEditor ?
        <RowSelection {...rest}>
          {children}
        </RowSelection>
        :
        children
      }
    </BaseGridRow>
  );
});
