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
    className,
    path,
    name,
    store,
    ...restProps
  } = props;

  const currentPath = getCurrentPath(name, path);
  const deleteItem = () => {
    currentPath && store?.setFieldValue(currentPath, undefined, true);
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
    className,
    name,
    path,
    field,
    store,
    item,
    children,
    ...restProps
  } = props;
  const currentPath = getCurrentPath(name, path);

  const addNewItem = () => {
    const properties = field?.properties;
    const addItem = item;
    const newField = addItem && { ...addItem };
    if (properties instanceof Array) {
      const len = properties?.length || 0;
      const newIndex = len;
      if (newField) {
        store?.addItemByIndex({ name: `[${newIndex}]`, field: newField }, newIndex, currentPath)
      }
    } else if (typeof properties === 'object') {
      const len = Object?.keys(properties)?.length || 0;
      const newIndex = len;
      if (newField?.name) {
        store?.addItemByIndex({ name: newField?.name, field: newField }, newIndex, currentPath);
      }
    }
    props?.onClick && props?.onClick();
  }

  return (
    <Button className={className} {...restProps} onClick={addNewItem}>
      {children ? children : '新增一条'}
    </Button>
  );
}
