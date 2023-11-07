import { CustomCol } from '../../';
import { ColProps } from 'antd';
import classnames from 'classnames';
import React from 'react';
import ColSelection from './col-selection';
import './col.less';
import FormDnd from '../FormDnd';
import { CommonSelectionProps } from '../BaseSelection';

export type CustomColProps = ColProps & CommonSelectionProps;
// col组件
const GridCol = React.forwardRef<any, CustomColProps>((props, ref) => {
  const {
    className,
    children,
    style,
    ...rest
  } = props;

  const { field } = rest || {};
  const isEditor = field?.isEditor;

  const cls = classnames(className, {
    'edit-col': isEditor
  });

  return (
    <CustomCol ref={ref} style={style} className={cls} {...rest}>
      {isEditor ?
        <ColSelection {...rest}>
          <FormDnd {...rest}>
            {children}
          </FormDnd>
        </ColSelection>
        :
        children
      }
    </CustomCol>
  );
});

export default GridCol;
