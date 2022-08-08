// export default demo5;
// import { Button } from 'antd';
import React, { useState } from 'react';
import RenderForm, { RenderFormProps, useFormRenderStore } from '@/components/react-easy-formdesign/form-render';
// import {Form, useFormStore} from '@/components/react-easy-formcore';
import DndSortable, { DndCondition, DndProps } from '@/components/react-dragger-sort';
import './index.less'
import Wrapper from './wrapper';
import { getCurrentPath } from '@/components/react-easy-formcore';
import Button from '@/components/button';

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
    // inline: true,
    inside: {
      type: 'row'
    },
    properties: {
      name1: {
        label: "只读展示",
        required: true,
        readOnly: true,
        readOnlyRender: "只读展示组件",
        initialValue: 1111,
        // outside: { type: 'col', props: { span: 6 } },
        hidden: '{{$formvalues.name5 == true}}',
        type: 'Input',
        props: {}
      },
      name2: {
        label: "输入框",
        required: true,
        // outside: { type: 'col', props: { span: 6 } },
        rules: [{ required: true, message: 'name1空了' }],
        initialValue: 1,
        hidden: '{{$formvalues.name5 == true}}',
        type: 'Input',
        props: {}
      },
      name3: {
        label: "数组",
        required: true,
        // outside: { type: 'col', props: { span: 6 } },
        // inside: { type: 'row' },
        footer: {
          type: 'add',
          props: {
            item: {
              required: true,
              rules: [{ required: true, message: 'name3[0]空了' }],
              // outside: { type: 'col', props: { span: 6 } },
              suffix: { type: 'delete' },
              type: 'Select',
              props: {
                labelInValue: true,
                style: { width: '100%' },
                children: [
                  { type: 'Select.Option', props: { key: 1, value: '1', children: '选项1' } },
                  { type: 'Select.Option', props: { key: 2, value: '2', children: '选项2' } }
                ]
              }
            }
          }
        },
        properties: [{
          required: true,
          suffix: { type: 'delete' },
          // outside: { type: 'col', props: { span: 6 } },
          rules: [{ required: true, message: 'name3[0]空了' }],
          initialValue: { label: '选项1', value: '1', key: '1' },
          type: 'Select',
          props: {
            labelInValue: true,
            style: { width: '100%' },
            children: [
              { type: 'Select.Option', props: { key: 1, value: '1', children: '选项1' } },
              { type: 'Select.Option', props: { key: 2, value: '2', children: '选项2' } }
            ]
          }
        }, {
          required: true,
          suffix: { type: 'delete' },
          // outside: { type: 'col', props: { span: 6 } },
          rules: [{ required: true, message: 'name3[1]空了' }],
          type: 'Select',
          props: {
            labelInValue: true,
            style: { width: '100%' },
            children: [
              { type: 'Select.Option', props: { key: 1, value: '1', children: '选项1' } },
              { type: 'Select.Option', props: { key: 2, value: '2', children: '选项2' } }
            ]
          }
        }]
      },
      name4: {
        label: '对象嵌套',
        required: true,
        // outside: { type: 'col', props: { span: 6 } },
        // inside: { type: 'row' },
        properties: {
          first: {
            label: '对象嵌套1',
            rules: [{ required: true, message: 'name1空了' }],
            // outside: { type: 'col', props: { span: 6 } },
            type: 'Select',
            props: {
              style: { width: '100%' },
              children: [{ type: 'Select.Option', props: { key: 1, value: '1', children: '选项1' } }]
            }
          },
          second: {
            label: '对象嵌套2',
            rules: [{ required: true, message: 'name2空了' }],
            // outside: { type: 'col', props: { span: 6 } },
            type: 'Select',
            props: {
              style: { width: '100%' },
              children: [{ type: 'Select.Option', props: { key: 1, value: '1', children: '选项1' } }]
            }
          },
          first1: {
            label: '对象嵌套3',
            // outside: { type: 'col', props: { span: 6 } },
            rules: [{ required: true, message: 'name3空了' }],
            type: 'Select',
            props: {
              style: { width: '100%' },
              children: [{ type: 'Select.Option', props: { key: 1, value: '1', children: '选项1' } }]
            }
          },
          second1: {
            label: '对象嵌套4',
            // outside: { type: 'col', props: { span: 6 } },
            rules: [{ required: true, message: 'name4空了' }],
            type: 'Select',
            props: {
              style: { width: '100%' },
              children: [{ type: 'Select.Option', props: { key: 1, value: '1', children: '选项1' } }]
            }
          }
        }
      },
      "col": {
        label: '整体布局',
        initialValue: { span: 12 },
        valueSetter: "{{(value)=> (value && value['span'])}}",
        valueGetter: "{{(value) => ({span: value})}}",
        // outside: { type: 'col', props: { span: 6 } },
        type: 'Select',
        props: {
          style: { width: '100%' },
          children: [
            { type: 'Select.Option', props: { key: 1, value: 12, children: '一行一列' } },
            { type: 'Select.Option', props: { key: 2, value: 6, children: '一行二列' } },
            { type: 'Select.Option', props: { key: 3, value: 4, children: '一行三列' } }
          ]
        }
      },
      name5: {
        label: 'name5',
        required: true,
        valueProp: 'checked',
        initialValue: true,
        rules: [{ required: true, message: 'name5空了' }],
        // outside: { type: 'col', props: { span: 6 } },
        type: 'Checkbox',
        props: {
          style: { width: '100%' },
          children: '多选框'
        }
      },
      name6: {
        label: 'Upload',
        type: 'Upload'
      },
    }
  })

  const store = useFormRenderStore();
  const [activePath, setActivePath] = useState<string>();

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

  const renderList: RenderFormProps['renderList'] = ({ children, path, field }) => {
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
          data-type="fragment"
          className='dnd-box'
          style={{ padding: '10px', minHeight: '50px', background: '#f5f5f5' }}
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
      )
    } else if (!path) {
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
          {children}
        </DndSortable>
      )
    } else {
      return children;
    }
  }

  const renderItem: RenderFormProps['renderItem'] = ({ children, ...restProps }) => {
    return (
      <Wrapper {...restProps}>
        {children}
      </Wrapper>
    );
  };

  return (
    <div style={{padding: '0 8px'}}>
      <RenderForm store={store} schema={schema} watch={watch}
        // renderList={renderList}
        // renderItem={renderItem}
      />
      <div style={{ marginLeft: '120px' }}>
        <Button onClick={onSubmit}>submit</Button>
      </div>
    </div>
  );
}
