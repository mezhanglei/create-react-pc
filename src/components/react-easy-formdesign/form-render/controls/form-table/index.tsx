import { ELementProps } from '@/components/react-easy-formdesign/form-designer/components/configs';
import React from 'react';
import { GeneratePrams } from '../..';
import DesignTable from './designTable';
import FormTable from './formTable';

export type TableProps = {
  value?: any;
  onChange?: (val: any) => void;
} & GeneratePrams<ELementProps>

const Table = React.forwardRef<any, TableProps>((props, ref) => {
  const {
    field,
  } = props;

  const isEditor = field?.isEditor;
  const columns = field?.props?.columns;

  return (
    isEditor ? <DesignTable {...props} columns={columns} ref={ref} /> : <FormTable {...props} ref={ref} columns={columns} />
  );
});

export default Table;
