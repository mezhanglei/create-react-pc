import { getCurrentPath } from '@/components/react-easy-formcore';
import { FormEditContext, FormRenderContext } from '@/components/react-easy-formdesign/design-context';
import { defaultGetId, endIsListItem } from '@/components/react-easy-formdesign/utils/utils';
import classnames from 'classnames';
import React, { CSSProperties, useContext } from 'react';
import { GenerateParams } from '../form-render';
import './wrapper.less';

export interface WrapperProps extends GenerateParams {
  children: any;
  style?: CSSProperties;
  className?: string;
}

function Wrapper(props: WrapperProps, ref: any) {
  const {
    children,
    style,
    className,
    ...restProps
  } = props;

  const { name, path, field } = restProps;
  const { formRenderStore, schema, selected } = useContext(FormRenderContext);
  const setEdit = useContext(FormEditContext);
  const currentPath = getCurrentPath(name, path);
  const isSelected = currentPath ? currentPath === selected : false;
  const nextIndex = (field?.index as number) + 1;
  const copyItem = () => {
    let newId;
    if (endIsListItem(currentPath)) {
      newId = `[${nextIndex}]`;
    } else {
      // 非数组项才生成id
      newId = defaultGetId(name);
    }
    const newField = formRenderStore?.getItemByPath(currentPath);
    formRenderStore?.addItemByIndex({ name: newId, field: newField }, nextIndex, path);
  }

  const deleteItem = () => {
    formRenderStore?.delItemByPath(currentPath);
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

export default React.forwardRef(Wrapper);