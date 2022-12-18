import { getCurrentPath, isListIndex } from '@/components/react-easy-formcore';
import { defaultGetId } from '../utils/utils';
import classnames from 'classnames';
import React, { CSSProperties, useContext } from 'react';
import { GeneratePrams } from '../../form-render';
import './form-item-wrapper.less';
import { ELementProps } from '../components/configs';
import { FormDesignContext, FormEditContext } from '../designer-context';

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
    store: designer,
    form: designerForm,
    ...restProps
  } = props;

  const currentPath = getCurrentPath(name, parent) as string;
  const { selected } = useContext(FormDesignContext);
  const { setEdit } = useContext(FormEditContext)
  const selectedName = selected?.name;
  const isSelected = name ? name === selectedName : false;
  const copyItem = () => {
    const nextIndex = (field?.index as number) + 1;
    const newField = designer?.getItemByPath(currentPath);
    const addItem = isListIndex(name) ? newField : { ...newField, name: defaultGetId(field?.source) }
    designer?.addItemByIndex(addItem, nextIndex, parent);
  }

  const deleteItem = () => {
    designer?.delItemByPath(currentPath);
    setEdit({ selected: {} })
  }

  const chooseItem = (e: any) => {
    e.stopPropagation();
    setEdit({
      selected: {
        name: name,
        parent: parent,
        source: field?.source,
        field: field
      }
    })
  }

  const prefixCls = "field-wrapper";

  const cls = classnames('field-wrapper', className, {
    [`${prefixCls}-active`]: isSelected
  })

  const Tool = (
    <div className='wrapper-tools'>
      <i className='iconfont icon-fuzhi' onClick={copyItem} />
      <i className='iconfont icon-shanchu' onClick={deleteItem} />
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
