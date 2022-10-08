import DndSortable, { DndProps } from '@/components/react-dragger-sort';
import { FormRenderContext } from '@/components/react-easy-formdesign/design-context';
import React, { useContext } from 'react';
import { GeneratePrams } from '../form-render';
import { SideBarGroupPath } from '../sidebar';
import './index.less';
import * as Configs from '../config'
import { defaultGetId } from '../utils/utils';

export interface RootDndProps extends GeneratePrams {
  children?: any;
}

function RootDnd(props: RootDndProps, ref: any) {
  const { children, parent } = props;
  const { viewerRenderStore } = useContext(FormRenderContext);

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
    const fromParts = dragGroupPath?.split('.')
    // 拖放区域的信息
    const dropGroupPath = to?.groupPath;
    const dropIndex = to?.index;
    const parentData = viewerRenderStore.getItemByPath(dropGroupPath)
    const dropGroupIsList = parentData instanceof Array;
    // 从侧边栏插入进来
    if (fromParts?.[0] === SideBarGroupPath) {
      const elementsKey = fromParts?.[1]
      const elements = elementsKey && Configs[elementsKey]
      const field = elements[dragIndex]
      const name = dropGroupIsList ? `[${dropIndex}]` : defaultGetId(field?.prefix);
      const addItem = { name, field }
      viewerRenderStore?.addItemByIndex(addItem, dropIndex, dropGroupPath);
      // 容器内部拖拽
    } else {
      viewerRenderStore.swapItemByPath({ index: dragIndex, parentPath: dragGroupPath }, { index: dropIndex, parentPath: dropGroupPath });
    }
  }

  if (!parent) {
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
  return children
};

export default React.forwardRef(RootDnd);
