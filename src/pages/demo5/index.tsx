import React, { Component, useState, useEffect, useRef, useCallback } from 'react';
import "./index.less";
import { Form, FormStore } from "@/components/react-easy-formcore";
import { Checkbox, Input, Radio, Select } from 'antd';
import RenderForm, { RenderFormChildren, FormRenderStore } from '@/components/react-easy-formrender';
import Button from '@/components/button';

// 原子组件
export const defaultWidgets: { [key: string]: any } = {
  input: Input,
  select: Select,
  radioGroup: Radio.Group,
  radio: Radio,
  option: Select.Option,
  button: Button,
  Checkbox: Checkbox
};

const watch = {
  'name1': (newValue, oldValue) => {
    console.log(newValue, oldValue)
  },
  'name2[0]': (newValue, oldValue) => {
    console.log(newValue, oldValue)
  },
  'name3': (newValue, oldValue) => {
    console.log(newValue, oldValue)
  }
}

class demo5 extends React.Component {
  store: FormRenderStore<any>;
  constructor(props) {
    super(props);
    // this.store = new FormStore();
    this.store = new FormRenderStore();
    this.state = {
      list: [{ value: 'sss', key: 1 }, { value: 'aaaa', key: 2 }],
      schema: {
        title: '1111',
        className: 'form-wrapper',
        properties: {
          name1: {
            label: "name1",
            widget: 'input',
            required: true,
            readOnly: true,
            readOnlyRender: 1111,
            rules: [{ required: true, message: 'name1空了' }],
            initialValue: 1111,
            // labelAlign: 'vertical',
            col: { span: 6 },
            hidden: '{{$form.name4 == true}}',
            widgetProps: {}
          },
          name8: {
            label: "name8",
            widget: 'input',
            required: true,
            // labelAlign: 'vertical',
            col: { span: 6 },
            rules: [{ required: true, message: 'name1空了' }],
            initialValue: 1111,
            hidden: '{{$form.name4 == true}}',
            widgetProps: {}
          },
          name9: {
            label: "name9",
            widget: 'input',
            required: true,
            col: { span: 6 },
            rules: [{ required: true, message: 'name1空了' }],
            initialValue: 1111,
            hidden: '{{$form.name4 == true}}',
            widgetProps: {}
          },
          name10: {
            label: "name10",
            widget: 'input',
            required: true,
            col: { span: 6 },
            rules: [{ required: true, message: 'name1空了' }],
            initialValue: 1111,
            hidden: '{{$form.name4 == true}}',
            widgetProps: {}
          },
          name2: {
            label: "name2",
            required: true,
            rules: [{ required: true, message: 'name2空了' }],
            col: { span: 6 },
            properties: [{
              widget: 'select',
              required: true,
              rules: [{ required: true, message: 'name2空了' }],
              initialValue: { label: '选项1', value: '1', key: '1' },
              widgetProps: {
                labelInValue: true,
                style: { width: '100%' },
                children: [{ widget: 'option', widgetProps: { key: 1, value: '1', children: '选项1' } }, { widget: 'option', widgetProps: { key: 2, value: '2', children: '选项2' } }]
              }
            }, {
              widget: 'select',
              required: true,
              rules: [{ required: true, message: 'name2空了' }],
              widgetProps: {
                labelInValue: true,
                style: { width: '100%' },
                children: [{ widget: 'option', widgetProps: { key: 1, value: '1', children: '选项1' } }]
              }
            }]
          },
          name3: {
            label: 'name3',
            required: true,
            col: { span: 6 },
            properties: {
              first: {
                rules: [{ required: true, message: 'name2空了' }],
                widget: 'select',
                widgetProps: {
                  style: { width: '100%' },
                  children: [{ widget: 'option', widgetProps: { key: 1, value: '1', children: '选项1' } }]
                }
              },
              second: {
                rules: [{ required: true, message: 'name2空了' }],
                widget: 'select',
                widgetProps: {
                  style: { width: '100%' },
                  children: [{ widget: 'option', widgetProps: { key: 1, value: '1', children: '选项1' } }]
                }
              }
            }
          },
          name4: {
            label: 'name4',
            widget: 'Checkbox',
            required: true,
            valueProp: 'checked',
            col: { span: 6 },
            initialValue: true,
            rules: [{ required: true, message: 'name3空了' }],
            widgetProps: {
              style: { width: '100%' },
              children: '多选框'
            }
          },
          button: {
            col: { span: 6 },
            widget: 'button',
            label: '',
            widgetProps: {
              htmlType: 'submit',
              children: 'xxx'
            }
          }
        }
      }
    };
  }

  componentDidMount() {
  }

  onSubmit = async (e) => {
    e?.preventDefault?.();
    const result = await this.store.validate();
    console.log(result, '表单结果');
  };

  validator = (value, callError) => {
    if (!value?.length || value?.length < 2) {
      callError('主动报错');
    }
    callError();
  }

  onChange = (value) => {
    // this.store.setFieldValue('name1', []);
  }

  onClick = () => {
  }

  onFieldsChange = (params) => {
  }

  render() {
    return (
      <div>
        {/* <Form store={this.store} onFieldsChange={this.onFieldsChange} onSubmit={this.onSubmit}>
          <Form.Item label="表单容器" name="a">
            <Form.List name="b">
              <div>
                <Form.Item key="name1" rules={[{ required: true, message: "不能为空1" }, { validator: this.validator, message: '自定义校验' }]}>
                  <Select
                    mode="multiple"
                    allowClear
                    style={{ width: '100%' }}
                    placeholder="Please select"
                    labelInValue
                    onChange={this.onChange}
                  >
                    {
                      this.state.list?.map((item) => {
                        return (
                          <Select.Option key={item.key}>
                            {item.value}
                          </Select.Option>
                        );
                      })
                    }
                  </Select>
                </Form.Item>
                <Form.Item key="name2" rules={[{ required: true, message: '不能为空2' }]}>
                  <Select
                    mode="multiple"
                    allowClear
                    style={{ width: '100%' }}
                    placeholder="Please select"
                    labelInValue
                  >
                    {
                      this.state.list?.map((item) => {
                        return (
                          <Select.Option key={item.key}>
                            {item.value}
                          </Select.Option>
                        );
                      })
                    }
                  </Select>
                </Form.Item>
              </div>
            </Form.List>
          </Form.Item>
          <Form.Item label="">
            <button onClick={this.onClick}>Submit</button>
          </Form.Item>
        </Form> */}
        <RenderForm widgets={defaultWidgets} store={this.store} onSubmit={this.onSubmit} onFieldsChange={this.onFieldsChange} schema={this.state.schema} watch={watch} />
        {/* <Form store={this.store} onFieldsChange={this.onFieldsChange} onSubmit={this.onSubmit}>
          <RenderFormChildren widgets={defaultWidgets} onFieldsChange={this.onFieldsChange} schema={this.state.schema} watch={watch} />
        </Form> */}
      </div>
    );
  }
}

export default demo5;
