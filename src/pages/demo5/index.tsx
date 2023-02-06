// export default demo5;
// import { Button } from 'antd';
import React, { useState } from 'react';
import RenderForm, { RenderFormChildren, useFormRenderStore } from '@/components/react-easy-formdesign/form-render';
import { Form, useFormStore } from '@/components/react-easy-formcore';
import './index.less'
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

  const [properties, setProperties] = useState({
    name1: {
      label: "只读展示",
      readOnly: true,
      readOnlyRender: "只读展示组件",
      initialValue: 1111,
      outside: { type: 'col', props: { span: 6 } },
      hidden: '{{$formvalues.name6 == true}}',
      type: 'Input',
      props: {}
    },
    name2: {
      label: "输入框",
      outside: { type: 'col', props: { span: 6 } },
      rules: '{{$formvalues.name6 == true ? [] : [{required: true, message:"222"}]}}',
      initialValue: 1,
      hidden: '{{$formvalues.name6 == true}}',
      type: 'Input',
      props: {}
    },
    name3: {
      label: "数组",
      outside: { type: 'col', props: { span: 6 } },
      footer: {
        type: 'add',
        props: {
          item: {
            rules: [{ required: true, message: 'name3[0]空了' }],
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
        suffix: { type: 'delete' },
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
        suffix: { type: 'delete' },
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
      outside: { type: 'col', props: { span: 6 } },
      properties: {
        first: {
          // label: '对象嵌套1',
          rules: [{ required: true, message: 'name1空了' }],
          type: 'Select',
          props: {
            style: { width: '100%' },
            children: [{ type: 'Select.Option', props: { key: 1, value: '1', children: '选项1' } }]
          }
        },
        second: {
          // label: '对象嵌套2',
          rules: [{ required: true, message: 'name2空了' }],
          type: 'Select',
          props: {
            style: { width: '100%' },
            children: [{ type: 'Select.Option', props: { key: 1, value: '1', children: '选项1' } }]
          }
        },
        first1: {
          // label: '对象嵌套3',
          rules: [{ required: true, message: 'name3空了' }],
          type: 'Select',
          props: {
            style: { width: '100%' },
            children: [{ type: 'Select.Option', props: { key: 1, value: '1', children: '选项1' } }]
          }
        },
        second1: {
          // label: '对象嵌套4',
          rules: [{ required: true, message: 'name4空了' }],
          type: 'Select',
          props: {
            style: { width: '100%' },
            children: [{ type: 'Select.Option', props: { key: 1, value: '1', children: '选项1' } }]
          }
        }
      }
    },
    name5: {
      label: '整体布局',
      initialValue: { span: 12 },
      valueSetter: "{{(value)=> (value && value['span'])}}",
      valueGetter: "{{(value) => ({span: value})}}",
      outside: { type: 'col', props: { span: 6 } },
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
    name6: {
      label: 'name6',
      valueProp: 'checked',
      initialValue: true,
      rules: [{ required: true, message: 'name6空了' }],
      outside: { type: 'col', props: { span: 6 } },
      type: 'Checkbox',
      props: {
        style: { width: '100%' },
        children: '多选框'
      }
    },
    name7: {
      label: 'Upload',
      type: 'Upload'
    },
  })

  const [properties1, setProperties1] = useState({
    part1: {
      label: "part1input",
      outside: { type: 'col', props: { span: 6 } },
      rules: [{ required: true, message: 'name1空了' }],
      initialValue: 1,
      hidden: '{{$formvalues.name6 == true}}',
      type: 'Input',
      props: {}
    },
  })

  const [properties2, setProperties2] = useState({
    part2: {
      label: "part2input",
      outside: { type: 'col', props: { span: 6 } },
      rules: [{ required: true, message: 'name1空了' }],
      initialValue: 1,
      hidden: '{{$formvalues.name6 == true}}',
      type: 'Input',
      props: {}
    },
  })

  const form = useFormStore();

  const onSubmit = async (e) => {
    e?.preventDefault?.();
    const result = await form.validate();
    console.log(result, '表单结果');
  };

  return (
    <div style={{ padding: '0 8px' }}>
      <RenderForm inside={{ type: 'row' }} form={form} properties={properties} watch={watch} />
      {/* <Form store={form}>
        <div>
          <p>part1</p>
          <RenderFormChildren inside={{ type: 'row' }} properties={properties1} watch={watch} />
        </div>
        <div>
          <p>part2</p>
          <RenderFormChildren inside={{ type: 'row' }} properties={properties2} watch={watch} />
        </div>
      </Form> */}
      <div style={{ marginLeft: '120px' }}>
        <Button onClick={onSubmit}>submit</Button>
      </div>
    </div>
  );
}
