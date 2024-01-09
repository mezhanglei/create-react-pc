import { Button } from 'antd';
import React, { useState } from 'react';
import FormRender, { useSimpleForm, useSimpleFormRender } from '@/components/FormRender';
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

  const properties = {
    name1: {
      label: "readonly",
      readOnly: true,
      readOnlyRender: "readonly component",
      type: 'Input',
      props: {}
    },
    name2: {
      label: "readonly",
      readOnly: true,
      readOnlyRender: "readonly component",
      type: 'Input',
      props: {}
    },
    name3: {
      // type: '',
      // props: {},
      properties: [{
        label: 'list[0]',
        rules: [{ required: true, message: 'list[0] empty' }],
        initialValue: { label: 'option1', value: '1', key: '1' },
        type: 'Select',
        props: {
          labelInValue: true,
          style: { width: '100%' },
          children: [
            { type: 'Select.Option', props: { key: 1, value: '1', children: 'option1' } },
            { type: 'Select.Option', props: { key: 2, value: '2', children: 'option2' } }
          ]
        }
      }, {
        label: 'list[1]',
        rules: [{ required: true, message: 'list[1] empty' }],
        type: 'Select',
        props: {
          labelInValue: true,
          style: { width: '100%' },
          children: [
            { type: 'Select.Option', props: { key: 1, value: '1', children: 'option1' } },
            { type: 'Select.Option', props: { key: 2, value: '2', children: 'option2' } }
          ]
        }
      }]
    },
    name4: {
      // type: '',
      // props: {},
      properties: {
        first: {
          label: 'first',
          rules: [{ required: true, message: 'first empty' }],
          type: 'Select',
          props: {
            style: { width: '100%' },
            children: [{ type: 'Select.Option', props: { key: 1, value: '1', children: 'option1' } }]
          }
        },
        second: {
          label: 'second',
          rules: [{ required: true, message: 'second empty' }],
          type: 'Select',
          props: {
            style: { width: '100%' },
            children: [{ type: 'Select.Option', props: { key: 1, value: '1', children: 'option1' } }]
          }
        }
      }
    },
    name5: {
      label: 'name5',
      initialValue: { span: 12 },
      valueSetter: "{{(value)=> (value && value['span'])}}",
      valueGetter: "{{(value) => ({span: value})}}",
      type: 'Select',
      props: {
        style: { width: '100%' },
        children: [
          { type: 'Select.Option', props: { key: 1, value: 12, children: 'option1' } },
          { type: 'Select.Option', props: { key: 2, value: 6, children: 'option2' } },
          { type: 'Select.Option', props: { key: 3, value: 4, children: 'option3' } }
        ]
      }
    },
    name6: {
      label: 'checkbox',
      valueProp: 'checked',
      initialValue: true,
      rules: [{ required: true, message: 'checkbox empty' }],
      type: 'Checkbox',
      props: {
        style: { width: '100%' },
        children: 'option'
      }
    },
  }

  const form = useSimpleForm();
  // const formrender = useSimpleFormRender();

  const onSubmit = async (e) => {
    e?.preventDefault?.();
    const result = await form.validate();
    console.log(result, 'result');
  };

  return (
    <div>
      <FormRender
        form={form}
        // formrender={formrender}
        properties={properties}
        watch={watch} />
      <div style={{ marginLeft: '120px' }}>
        <Button onClick={onSubmit}>submit</Button>
      </div>
    </div>
  );
}