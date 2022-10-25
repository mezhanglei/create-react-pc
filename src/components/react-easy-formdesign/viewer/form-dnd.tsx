import DndSortable, { DndCondition, DndProps } from '@/components/react-dragger-sort';
import { FormRenderContext } from '@/components/react-easy-formdesign/design-context';
import React, { useContext } from 'react';
import { GeneratePrams, getCurrentPath } from '../form-render';
import './index.less';
import * as Configs from '../config'
import { defaultGetId } from '../utils/utils';
import { SideBarGroup } from '../sidebar/sidebar-list';
import { getInitialValues } from '@/components/react-easy-formrender/utils/utils';

export interface FormDndProps extends GeneratePrams {
  children?: any;
}

/**
 * 给表单结构中插入可拖放区域
 * @param props 
 * @param ref 
 * @returns 
 */
function FormDnd(props: FormDndProps, ref: any) {
  const { children, parent, name, field } = props;
  // 是否为根节点
  const isRoot = !parent && !name && !field
  const { viewerRenderStore } = useContext(FormRenderContext);

  const onItemSwap: DndProps['onUpdate'] = (params) => {
    const { from, to } = params;
    console.log(params, '同域拖放');
    // 拖拽区域信息
    const dragGroup = from.group;
    // 额外传递的信息
    const dragCollection = dragGroup?.collection;
    const dragIndex = from?.index;
    // 拖放区域的信息
    const dropGroup = to?.group;
    // 额外传递的信息
    const dropCollection = dropGroup?.collection;
    const dropIndex = to?.index;
    viewerRenderStore.swapItemByPath({ index: dragIndex, parent: dragCollection?.path }, { index: dropIndex, parent: dropCollection?.path });
  }

  const onItemAdd: DndProps['onUpdate'] = (params) => {
    const { from, to } = params;
    console.log(params, '跨域拖放');
    // 拖拽区域信息
    const dragGroup = from.group;
    // 额外传递的信息
    const dragCollection = dragGroup?.collection;
    const dragIndex = from?.index;
    // 拖放区域的信息
    const dropGroup = to?.group;
    // 额外传递的信息
    const dropCollection = dropGroup?.collection;
    const dropIndex = to?.index;
    const parentData = viewerRenderStore.getItemByPath(dropCollection?.path)
    const dropGroupIsList = parentData instanceof Array;
    // 从侧边栏插入进来
    if (dragCollection?.type === SideBarGroup) {
      const elements = Configs[dragCollection?.elementsKey]
      const item = elements[dragIndex]
      const field = { ...item, ...getInitialValues(item?.settings) }
      const name = dropGroupIsList ? `[${dropIndex}]` : defaultGetId(field?.prefix);
      const addItem = { name, field }
      viewerRenderStore?.addItemByIndex(addItem, dropIndex, dropCollection?.path);
      // 容器内部拖拽
    } else {
      viewerRenderStore.swapItemByPath({ index: dragIndex, parent: dragCollection?.path }, { index: dropIndex, parent: dropCollection?.path });
    }
  }

  if (isRoot) {
    return (
      <DndSortable
        onUpdate={onItemSwap}
        onAdd={onItemAdd}
        data-type="ignore"
        className='viewer-dnd-root'
        options={{
          childDrag: true,
          allowDrop: true,
          allowSort: true
        }}
      >
        {children}
      </DndSortable>
    )
  }
  // const isList = field?.properties instanceof Array;
  // // 允许拖出的条件
  // const outCondition: DndCondition = (params, options) => {
  //   if (isList) {
  //     const { from, to } = params;
  //     const fromCollection = from?.group?.props?.collection
  //     const toCollection = to?.group?.props?.collection
  //     if (fromCollection?.path === toCollection?.path) {
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   }
  //   return true;
  // }
  // // 允许拖进的条件
  // const dropCondition: DndCondition = (params, options) => {
  //   if (isList) {
  //     const { from } = params;
  //     const fromCollection = from?.group?.props?.collection
  //     if (fromCollection?.type === SideBarGroup) {
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   }
  //   return true;
  // }
  // const currentPath = getCurrentPath(name, parent);
  // return (
  //   <DndSortable
  //     onUpdate={onItemSwap}
  //     onAdd={onItemAdd}
  //     data-type="ignore"
  //     className='viewer-dnd-group'
  //     collection={{ path: currentPath }}
  //     options={{
  //       childDrag: true,
  //       childOut: outCondition,
  //       allowDrop: dropCondition,
  //       allowSort: true
  //     }}
  //   >
  //     {children}
  //   </DndSortable>
  // )
  return children
};

export default React.forwardRef(FormDnd);
