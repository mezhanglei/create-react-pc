import { getCurrentPath } from '@/components/react-easy-formcore';
import { FormEditContext, FormRenderContext } from '@/components/react-easy-formdesign/design-context';
import { defaultGetId, endIsListItem } from '@/components/react-easy-formdesign/utils/utils';
import classnames from 'classnames';
import React, { CSSProperties, useContext } from 'react';
import { FormItemInfo } from '../form-render';
import './render-item.less';

export interface RenderItemProps extends FormItemInfo {
  children: any;
  style?: CSSProperties;
  className?: string;
}

function RenderItem(props: RenderItemProps, ref: any) {
  const {
    children,
    style,
    className,
    ...restProps
  } = props;

  const { name, path, field } = restProps;
  const { viewerRenderStore, schema, selected, selectedKey } = useContext(FormRenderContext);
  const setEdit = useContext(FormEditContext);
  const currentPath = getCurrentPath(name, path) as string;
  const isSelected = currentPath ? currentPath === selected : false;
  const copyItem = () => {
    let newId;
    const nextIndex = (field?.index as number) + 1;
    if (endIsListItem(currentPath)) {
      newId = `[${nextIndex}]`;
    } else {
      // 非数组项才生成id
      newId = defaultGetId(selectedKey);
    }
    const newField = viewerRenderStore?.getItemByPath(currentPath);
    viewerRenderStore?.addItemByIndex({ name: newId, field: newField }, nextIndex, path);
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

export default React.forwardRef(RenderItem);
