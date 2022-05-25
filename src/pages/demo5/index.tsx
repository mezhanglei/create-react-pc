// export default demo5;
import { Button } from 'antd';
import React, { useState } from 'react';
import RenderForm, { RenderFormProps, useFormRenderStore } from './form-render';
// import {Form, useFormStore} from '@/components/react-easy-formcore';
import DndSortable, { DndProps } from '@/components/react-dragger-sort';
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
    layout: 'vertical',
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
        // col: { span: 6 },
        rules: [{ required: true, message: 'name1空了' }],
        initialValue: 1,
        hidden: '{{$form.name5 == true}}',
        widgetProps: {}
      },
      name3: {
        label: "数组",
        required: true,
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
        // required: true,
        rules: [{ required: true, message: '上传空了' }],
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

  const onItemSwap: DndProps['onUpdate'] = (params) => {
    const { from, to } = params;
    console.log(params, '同域拖放');
    // 拖拽区域信息
    const dragGroupPath = from.groupPath;
    const dragIndex = from?.index;
    // 拖放区域的信息
    const dropGroupPath = to?.groupPath;
    const dropIndex = to?.index;
    store.swapItemByPath({ index: dragIndex, parentPath: dragGroupPath }, { index: dropIndex, parentPath: dropGroupPath });
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
    store.swapItemByPath({ index: dragIndex, parentPath: dragGroupPath }, { index: dropIndex, parentPath: dropGroupPath });
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
    if (!(field?.properties instanceof Array)) {
      return (
        <div data-type="fragment" style={{ background: '#fff', padding: '20px', width: '100%' }}>
          <DndSortable
            onUpdate={onItemSwap}
            onAdd={onItemAdd}
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
    } else if (!parent) {
      return (
        <DndSortable
          onUpdate={onItemSwap}
          onAdd={onItemAdd}
          data-type="fragment"
          className='dnd-box'
          options={{
            childDrag: true,
            allowDrop: true,
            allowSort: true
          }}
        >
          {getChildrenList(properties, generate, parent)}
        </DndSortable>
      )
    } else {
      return getChildrenList(properties, generate, parent);
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
