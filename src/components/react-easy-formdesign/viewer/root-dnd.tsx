import DndSortable, { DndCondition, DndProps } from '@/components/react-dragger-sort';
import { FormRenderContext } from '@/components/react-easy-formdesign/design-context';
import React, { useContext } from 'react';
import { GeneratePrams, getCurrentPath } from '../form-render';
import { SideBarGroupPath } from '../sidebar';
import './index.less';

export interface RootDndProps extends GeneratePrams {
  children?: any;
}

function RootDnd(props: RootDndProps, ref: any) {
  const { children, name, parent, field } = props;
  const currentPath = getCurrentPath(name, parent);
  const { viewerRenderStore, schema, selected } = useContext(FormRenderContext);

  const onItemSwap: DndProps['onUpdate'] = (params) => {
    const { from, to } = params;
    console.log(params, '同域拖放');
    // 拖拽区域信息
    const dragGroupPath = from.groupPath;
    const dragIndex = from?.index;
    // 拖放区域的信息
    const dropGroupPath = to?.groupPath;
    const dropIndex = to?.index;
    viewerRenderStore.swapItemByPath({ index: dragIndex, parentPath: dragGroupPath }, { index: dropIndex, parentPath: dropGroupPath });
  }

  const onItemAdd: DndProps['onUpdate'] = (params) => {
    const { from, to } = params;
    console.log(params, '跨域拖放');
    // 拖拽区域信息
    const dragGroupPath = from.groupPath;
    const dragIndex = from?.index;
    // 拖放区域的信息
    const dropGroupPath = to?.groupPath;
    const dropIndex = to?.index;
    // 从侧边栏插入进来
    if (from?.groupPath === SideBarGroupPath) {
      // 拖拽项
      // let dragItem = getItem(soundData, `${from?.index}`);
      // dragItem = dragItem?.name === 'Containers' ? { children: [], ...dragItem } : dragItem;
      // // 放置项
      // const dropGroupPath = to.groupPath;
      // const dropIndex = to?.index;
      // const newData = addDragItem(cloneData, dragItem, dropIndex, dropGroupPath);
      // this.setState({
      //   data: newData
      // });
      viewerRenderStore.addItemByIndex()
      // 容器内部拖拽
    } else {
      viewerRenderStore.swapItemByPath({ index: dragIndex, parentPath: dragGroupPath }, { index: dropIndex, parentPath: dropGroupPath });
    }
  }

  if (field?.properties) {
    const isList = field?.properties instanceof Array;
    // 允许拖出的条件
    const outCondition: DndCondition = (params, options) => {
      if (isList) {
        const { from, to } = params;
        if (from?.groupPath === to?.groupPath) {
          return true;
        } else {
          return false;
        }
      }
      return true;
    }
    // 允许拖进的条件
    const dropCondition: DndCondition = (params, options) => {
      if (isList) {
        const { from } = params;
        if (from?.groupPath === 'sidebar') {
          return true;
        } else {
          return false;
        }
      }
      return true;
    }

    return (
      <DndSortable
        onUpdate={onItemSwap}
        onAdd={onItemAdd}
        data-type="ignore"
        className='viewer-dnd-group'
        options={{
          groupPath: currentPath,
          childDrag: true,
          childOut: outCondition,
          allowDrop: dropCondition,
          allowSort: true
        }}
      >
        {children}
      </DndSortable>
    )
  } else if (!parent) {
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
  } else {
    return children;
  }
};

export default React.forwardRef(RenderList);
