import { ELementProps } from '@/components/react-easy-formdesign/form-render/configs/components';
import { GridCol as BaseGridCol } from '@/components/react-easy-formrender/components/grid';
import { ColProps } from 'antd';
import classnames from 'classnames';
import React from 'react';
import { GeneratePrams } from '../..';
import ColSelection from './col-selection';
import './col.less';
import ControlDnd from '@/components/react-easy-formdesign/form-designer/editor/dnd';

// row组件
export type CustomColProps = ColProps & GeneratePrams<ELementProps>;
// col组件
export const GridCol = React.forwardRef<any, CustomColProps>((props, ref) => {
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
    <BaseGridCol ref={ref} style={style} className={cls} {...rest}>
      {isEditor ?
        <ColSelection {...rest}>
          <ControlDnd {...rest}>
            {children}
          </ControlDnd>
        </ColSelection>
        :
        children
      }
    </BaseGridCol>
  );
});
