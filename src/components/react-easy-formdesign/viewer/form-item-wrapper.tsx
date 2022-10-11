import { getCurrentPath, isListItem } from '@/components/react-easy-formcore';
import { FormEditContext, FormRenderContext } from '@/components/react-easy-formdesign/design-context';
import { defaultGetId } from '@/components/react-easy-formdesign/utils/utils';
import classnames from 'classnames';
import React, { CSSProperties, useContext } from 'react';
import { ELementProps } from '../config';
import { GeneratePrams } from '../form-render';
import './form-item-wrapper.less';

export interface FormItemWrapperProps extends GeneratePrams<ELementProps> {
  children?: any;
  style?: CSSProperties;
  className?: string;
}
/**
 * 给表单中的控件外围添加选中框
 * @param props 
 * @param ref 
 * @returns 
 */
function FormItemWrapper(props: FormItemWrapperProps, ref: any) {
  const {
    children,
    style,
    className,
    name,
    parent,
    field,
    ...restProps
  } = props;

  const { viewerRenderStore, schema, selected } = useContext(FormRenderContext);
  const setEdit = useContext(FormEditContext);
  const currentPath = getCurrentPath(name, parent) as string;
  const isSelected = currentPath ? currentPath === selected : false;
  
  const copyItem = () => {
    const nextIndex = (field?.index as number) + 1;
    const newId = isListItem(name) ? `[${nextIndex}]` : defaultGetId(field?.prefix)
    const newField = viewerRenderStore?.getItemByPath(currentPath);
    viewerRenderStore?.addItemByIndex({ name: newId, field: newField }, nextIndex, parent);
  }

  const deleteItem = () => {
    viewerRenderStore?.delItemByPath(currentPath);
    setEdit({ selected: undefined });
  }

  const chooseItem = (e: any) => {
    e.stopPropagation();
    setEdit({ selected: currentPath });
  }

  const prefixCls = "field-wrapper";

  const cls = classnames('field-wrapper', className, {
    [`${prefixCls}-active`]: isSelected
  })

  const Tool = (
    <div className='wrapper-tools'>
      <div>
        <i className='iconfont icon-shanchu' onClick={deleteItem} />
        <i className='iconfont icon-fuzhi' onClick={copyItem} />
      </div>
    </div>
  );

  return (
    <div ref={ref} className={cls} style={style} onClick={chooseItem} {...restProps}>
      {isSelected ? Tool : null}
      {children}
    </div>
  );
};

export default React.forwardRef(FormItemWrapper);
