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
    properties: {
      name1: {
        label: "只读展示",
        widget: 'Input',
        required: true,
        readOnly: true,
        readOnlyRender: "只读展示组件",
        initialValue: 1111,
        // col: { span: 6 },
        hidden: '{{$formvalues.name5 == true}}',
        widgetProps: {}
      },
      name2: {
        label: "输入框",
        widget: 'Input',
        required: true,
        // col: { span: 6 },
        rules: [{ required: true, message: 'name1空了' }],
        initialValue: 1,
        hidden: '{{$formvalues.name5 == true}}',
        widgetProps: {}
      },
      name3: {
        label: "数组",
        required: true,
        footer: {
          type: 'add',
          addItem: {
            widget: 'Select',
            required: true,
            rules: [{ required: true, message: 'name3[0]空了' }],
            suffix: { type: 'delete' },
            widgetProps: {
              labelInValue: true,
              style: { width: '100%' },
              children: [
                { widget: 'Select.Option', widgetProps: { key: 1, value: '1', children: '选项1' } },
                { widget: 'Select.Option', widgetProps: { key: 2, value: '2', children: '选项2' } }
              ]
            }
          }
        },
        // col: { span: 6 },
        properties: [{
          widget: 'Select',
          required: true,
          suffix: { type: 'delete' },
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
          suffix: { type: 'delete' },
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
        label: '对象嵌套',
        required: true,
        // col: { span: 6 },
        properties: {
          first: {
            label: '对象嵌套1',
            rules: [{ required: true, message: 'name1空了' }],
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
            rules: [{ required: true, message: 'name3空了' }],
            widget: 'Select',
            col: { span: 6 },
            widgetProps: {
              style: { width: '100%' },
              children: [{ widget: 'Select.Option', widgetProps: { key: 1, value: '1', children: '选项1' } }]
            }
          },
          second1: {
            label: '对象嵌套4',
            rules: [{ required: true, message: 'name4空了' }],
            widget: 'Select',
            col: { span: 6 },
            widgetProps: {
              style: { width: '100%' },
              children: [{ widget: 'Select.Option', widgetProps: { key: 1, value: '1', children: '选项1' } }]
            }
          }
        }
      },
      name5: {
        label: 'name5',
        widget: 'Checkbox',
        required: true,
        valueProp: 'checked',
        // col: { span: 6 },
        initialValue: true,
        rules: [{ required: true, message: 'name5空了' }],
        widgetProps: {
          style: { width: '100%' },
          children: '多选框'
        }
      },
      name6: {
        label: 'Upload',
        widget: 'Upload'
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

  const customList: RenderFormProps['customList'] = ({ children, parent }) => {
    const { path, field } = parent || {};
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
          {children}
        </DndSortable>
      )
    } else {
      return children;
    }
  }

  const wrapper: RenderFormProps['customInner'] = ({ children, ...restProps }) => {
    return (
      <Wrapper {...restProps}>
        {children}
      </Wrapper>
    );
  };

  return (
    <div>
      <RenderForm store={store} schema={schema} watch={watch}
        customList={customList}
        customInner={wrapper}
      />
      <div style={{ marginLeft: '120px' }}>
        <Button onClick={onSubmit}>submit</Button>
      </div>
    </div>
  );
}
