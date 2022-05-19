// export default demo5;
import { Button } from 'antd';
import React, { useState } from 'react';
import RenderForm, { RenderFormProps, useFormRenderStore } from './form-render';
// import {Form, useFormStore} from '@/components/react-easy-formcore'
import DndSortable, { arraySwap, DndProps } from '@/components/react-dragger-sort';
import './index.less'

export default function Demo5(props) {

  const watch = {
    'name2': (newValue, oldValue) => {
      console.log(newValue, oldValue)
    },
    'name3[0]': (newValue, oldValue) => {
      console.log(newValue, oldValue)
    },
    'name4': (newValue, oldValue) => {
      console.log(newValue, oldValue)
    }
  }

  const [schema, setSchema] = useState({
    properties: {
      name1: {
        label: "只读展示",
        widget: 'Input',
        required: true,
        readOnly: true,
        readOnlyRender: "只读展示组件",
        initialValue: 1111,
        // col: { span: 6 },
        hidden: '{{$form.name5 == true}}',
        widgetProps: {}
      },
      name2: {
        label: "输入框",
        widget: 'Input',
        required: true,
        // labelAlign: 'vertical',
        // col: { span: 6 },
        rules: [{ required: true, message: 'name1空了' }],
        initialValue: 1,
        hidden: '{{$form.name5 == true}}',
        widgetProps: {}
      },
      name3: {
        label: "数组",
        required: true,
        // labelAlign: 'vertical',
        // col: { span: 6 },
        properties: [{
          widget: 'Select',
          required: true,
          // col: { span: 6 },
          rules: [{ required: true, message: 'name3[0]空了' }],
          initialValue: { label: '选项1', value: '1', key: '1' },
          widgetProps: {
            labelInValue: true,
            style: { width: '100%' },
            children: [
              { widget: 'Select.Option', widgetProps: { key: 1, value: '1', children: '选项1' } },
              { widget: 'Select.Option', widgetProps: { key: 2, value: '2', children: '选项2' } }
            ]
          }
        }, {
          widget: 'Select',
          required: true,
          // col: { span: 6 },
          rules: [{ required: true, message: 'name3[1]空了' }],
          widgetProps: {
            labelInValue: true,
            style: { width: '100%' },
            children: [
              { widget: 'Select.Option', widgetProps: { key: 1, value: '1', children: '选项1' } },
              { widget: 'Select.Option', widgetProps: { key: 2, value: '2', children: '选项2' } }
            ]
          }
        }]
      },
      name4: {
        // label: '对象嵌套',
        required: true,
        // labelAlign: 'vertical',
        // col: { span: 6 },
        properties: {
          first: {
            label: '对象嵌套1',
            rules: [{ required: true, message: 'name4空了' }],
            widget: 'Select',
            col: { span: 6 },
            widgetProps: {
              style: { width: '100%' },
              children: [{ widget: 'Select.Option', widgetProps: { key: 1, value: '1', children: '选项1' } }]
            }
          },
          second: {
            label: '对象嵌套2',
            rules: [{ required: true, message: 'name2空了' }],
            widget: 'Select',
            col: { span: 6 },
            widgetProps: {
              style: { width: '100%' },
              children: [{ widget: 'Select.Option', widgetProps: { key: 1, value: '1', children: '选项1' } }]
            }
          },
          first1: {
            label: '对象嵌套3',
            rules: [{ required: true, message: 'name4空了' }],
            widget: 'Select',
            col: { span: 6 },
            widgetProps: {
              style: { width: '100%' },
              children: [{ widget: 'Select.Option', widgetProps: { key: 1, value: '1', children: '选项1' } }]
            }
          },
          second1: {
            label: '对象嵌套4',
            rules: [{ required: true, message: 'name2空了' }],
            widget: 'Select',
            col: { span: 6 },
            widgetProps: {
              style: { width: '100%' },
              children: [{ widget: 'Select.Option', widgetProps: { key: 1, value: '1', children: '选项1' } }]
            }
          },
        }
      },
      name5: {
        label: 'name5',
        widget: 'Checkbox',
        // labelAlign: 'vertical',
        required: true,
        valueProp: 'checked',
        // col: { span: 6 },
        initialValue: true,
        rules: [{ required: true, message: 'name3空了' }],
        widgetProps: {
          style: { width: '100%' },
          children: '多选框'
        }
      },
      name6: {
        label: 'Upload',
        widget: 'Upload',
        dependencies: ['name3', 'name4'],
        // labelAlign: 'vertical',
        // required: true,
        // rules: [{ required: true, message: 'name3空了' }],
        col: { span: 6 }
      },
    }
  })

  const store = useFormRenderStore();

  const onSubmit = async (e) => {
    e?.preventDefault?.();
    const result = await store.validate();
    console.log(result, '表单结果');
  };

  const onUpdate: DndProps['onUpdate'] = (params) => {
    const { drag, drop } = params;
    console.log(params, '同区域');
    const dragIndex = drag?.index;
    const dropIndex = drop?.dropIndex;
    const parentPath = drag?.groupPath;
    store.swapItemByPath({ index: dragIndex, parentPath: parentPath }, { index: dropIndex, parentPath: parentPath });
  }

  const onAdd: DndProps['onAdd'] = (params) => {
    const { drag, drop } = params;
    console.log(params, '跨区域');
    // 拖拽区域信息
    const dragGroupPath = drag.groupPath;
    const dragIndex = drag?.index;
    const dragPath = drag?.path;
    // 拖放区域的信息
    const dropGroupPath = drop.groupPath;
    const dropIndex = drop?.dropIndex;
    const dropPath = drop?.path;
    // 容器外面添加进来
    // if (drag?.groupPath === 'components') {
    //   // 拖拽项
    //   let dragItem = getItem(soundData, `${drag?.index}`);
    //   dragItem = dragItem?.name === 'Containers' ? { children: [], ...dragItem } : dragItem;
    //   // 放置项
    //   const dropGroupPath = drop.groupPath;
    //   const dropIndex = drop?.dropIndex;
    //   const newData = addDragItem(cloneData, dragItem, dropIndex, dropGroupPath);
    //   this.setState({
    //     data: newData
    //   });
    //   // 容器内部拖拽
    // } else {
    //   // 拖拽区域信息
    //   const dragGroupPath = drag.groupPath;
    //   const dragIndex = drag?.index;
    //   const dragPath = drag?.path;
    //   const dragItem = getItem(cloneData, dragPath);
    //   // 拖放区域的信息
    //   const dropGroupPath = drop.groupPath;
    //   const dropIndex = drop?.dropIndex;
    //   const dropPath = drop?.path;
    //   const dragIndexPathArr = indexToArray(dragPath);
    //   const dropIndexPathArr = indexToArray(dropPath || dropGroupPath);
    //   // 先计算内部的变动，再计算外部的变动
    //   if (dragIndexPathArr?.length > dropIndexPathArr?.length || !dropIndexPathArr?.length) {
    //     // 减去拖拽的元素
    //     const removeData = removeDragItem(cloneData, dragIndex, dragGroupPath);
    //     // 添加新元素
    //     const addAfterData = addDragItem(removeData, dragItem, dropIndex, dropGroupPath);
    //     this.setState({ data: addAfterData });
    //   } else {
    //     // 添加新元素
    //     const addAfterData = addDragItem(cloneData, dragItem, dropIndex, dropGroupPath);
    //     // 减去拖拽的元素
    //     const newData = removeDragItem(addAfterData, dragIndex, dragGroupPath);
    //     this.setState({ data: newData });
    //   }
    // }
  }

  const getChildrenList: RenderFormProps['customRender'] = (properties, generate, parent) => {
    const { path } = parent || {};
    return (
      properties instanceof Array ?
        properties?.map((formField, index) => {
          return generate({ name: `[${index}]`, field: formField, path });
        })
        :
        Object.entries(properties || {})?.map(
          ([name, formField]) => {
            return generate({ name: name, field: formField, path });
          }
        )
    )
  }

  const customRender: RenderFormProps['customRender'] = (properties, generate, parent) => {
    const { path, field } = parent || {};
    if (field?.properties) {
      return (
        <div data-type="fragment" style={{ background: '#fff', padding: '20px', width: '100%' }}>
          <DndSortable
            onUpdate={onUpdate}
            onAdd={onAdd}
            data-type="fragment"
            className='dnd-box'
            style={{ background: '#f5f5f5' }}
            options={{
              groupPath: path,
              childDrag: true,
              allowDrop: true,
              allowSort: true
            }}
          >
            {getChildrenList(properties, generate, parent)}
          </DndSortable>
        </div>
      )
    } else {
      return (
        <DndSortable
          onUpdate={onUpdate}
          onAdd={onAdd}
          data-type="fragment"
          className='dnd-box'
          options={{
            groupPath: path,
            childDrag: true,
            allowDrop: true,
            allowSort: true
          }}
        >
          {getChildrenList(properties, generate, parent)}
        </DndSortable>
      )
    }
  }

  return (
    <div>
      <RenderForm store={store} schema={schema} watch={watch}
        customRender={customRender}
      />
      <div style={{ marginLeft: '120px' }}>
        <Button onClick={onSubmit}>submit</Button>
      </div>
    </div>
  );
}
