import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import './btn.less';
import { FormFieldProps, GeneratePrams } from '../types';
import Button from '@/components/button';
import { getCurrentPath } from '../../react-easy-formcore';

export interface DeleteBtnProps extends GeneratePrams {
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}
export const DeleteBtn: React.FC<DeleteBtnProps> = (props) => {

  const {
    name,
    field,
    parent,
    store,
    form,
    className,
    ...restProps
  } = props;

  const currentPath = getCurrentPath(name, parent);
  const deleteItem = () => {
    currentPath && form?.setFieldValue(currentPath, undefined, false);
    currentPath && store?.delItemByPath(currentPath);
  }

  const cls = classnames('iconfont icon-delete', className)
  return <i onClick={deleteItem} className={cls} {...restProps} />
}

export interface AddBtnProps extends GeneratePrams {
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
  item?: FormFieldProps;
}
export const AddBtn: React.FC<AddBtnProps> = (props) => {

  const {
    name,
    field,
    parent,
    store,
    form,
    item,
    className,
    children,
    ...restProps
  } = props;
  const currentPath = getCurrentPath(name, parent);

  const addNewItem = () => {
    const properties = field?.properties;
    const nextIndex = typeof properties === 'object' && Object?.keys(properties)?.length || 0;
    if (item) {
      currentPath && store?.addItemByIndex(item, nextIndex, currentPath);
    }
    props?.onClick && props?.onClick();
  }

  return (
    <Button className={className} {...restProps} onClick={addNewItem}>
      {children ? children : '新增一条'}
    </Button>
  );
}
