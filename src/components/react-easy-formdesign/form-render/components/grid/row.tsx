import { GridRow as BaseGridRow } from '@/components/react-easy-formrender/components/grid';
import React from 'react';
import RowSelection from './row-selection';
import { RowProps } from 'antd';
import classnames from 'classnames';
import './row.less';
import { CommonSelectionProps } from '../BaseSelection';

export type CustomRowProps = RowProps & CommonSelectionProps;

const GridRow = React.forwardRef<any, CustomRowProps>((props, ref) => {
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

export default GridRow;
