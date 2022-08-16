import DndSortable, { DndCondition, DndProps } from '@/components/react-dragger-sort';
import { FormRenderContext } from '@/components/react-easy-formdesign/design-context';
import React, { useContext } from 'react';
import { GeneratePrams } from '../form-render';
import './index.less';
import RenderItem from './render-item';

export interface RenderListProps extends GeneratePrams {
  children: any;
}

function RenderList(props: RenderListProps, ref: any) {
  const { children, name, path, field } = props;

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
    viewerRenderStore.swapItemByPath({ index: dragIndex, parentPath: dragGroupPath }, { index: dropIndex, parentPath: dropGroupPath });
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
      // <RenderItem name={name} path={path} field={field}>
      <DndSortable
        onUpdate={onItemSwap}
        onAdd={onItemAdd}
        data-type="fragment"
        className='viewer-dnd-group'
        options={{
          groupPath: path,
          childDrag: true,
          childOut: outCondition,
          allowDrop: dropCondition,
          allowSort: true
        }}
      >
        {children}
      </DndSortable>
      // </RenderItem>
    )
  } else if (!path) {
    return (
      <DndSortable
        onUpdate={onItemSwap}
        onAdd={onItemAdd}
        data-type="fragment"
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
